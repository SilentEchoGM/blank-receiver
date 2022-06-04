import fs from "fs-extra";
import { join } from "path";
import WebSocket from "ws";
import { SOS } from "./sosPluginEvents";
import { isMiscPacket } from "./utils";

console.log("Starting...");

const ws = new WebSocket("ws://localhost:49122");

const timeString = (date = new Date()) => {
  return `${date.toISOString()}: `;
};

let lastEventCount = 0;
let lastEvent = "";
let lastDate = new Date();
let gameId = "";
let fileStreamCount: fs.WriteStream | null = null;
let fileStreamCountReady = false;
let fileStreamPackets: fs.WriteStream | null = null;
let fileStreamPacketsReady = false;
const cacheCount: string[] = [];
const cachePackets: SOS.Packet[] = [];

ws.on("message", (data) => {
  const parsed: SOS.Packet = JSON.parse(data.toString());

  if (isMiscPacket(parsed)) {
    if (parsed.data.match_guid !== gameId) {
      console.log(`NEW GAME`);
      if (fileStreamCount) {
        fileStreamCount.close();
        fileStreamCount = null;
      }
      gameId = parsed.data.match_guid;
      console.log(`GAME ID: ${gameId}`);
      const countPath = join(__dirname, "..", "out", gameId + ".game");
      fileStreamCount = fs.createWriteStream(countPath);
      fileStreamCount.on("open", () => {
        fileStreamCountReady = true;
        cacheCount.forEach((str: string) => {
          if (!fileStreamCount) {
            throw new Error("This error should never happen.");
          }
          fileStreamCount.write(str);
        });

        cacheCount.length = 0;
      });
      fileStreamCount.on("close", () => {
        fileStreamCountReady = false;
      });

      const packetsPath = join(__dirname, "..", "out", gameId + ".packets");
      fileStreamPackets = fs.createWriteStream(packetsPath);
      fileStreamPackets.on("open", () => {
        fileStreamPacketsReady = true;
        cachePackets.forEach((packet) => {
          if (!fileStreamPackets) {
            throw new Error("This error should never happen.");
          }
          fileStreamPackets.write(JSON.stringify(packet) + "\n");
        });

        cachePackets.length = 0;
      });
      fileStreamPackets.on("close", () => {
        fileStreamPacketsReady = false;
      });
    }
  }

  if (fileStreamPacketsReady && fileStreamPackets) {
    fileStreamPackets.write(JSON.stringify(parsed) + "\n");
  } else {
    cachePackets.push(parsed);
  }

  if (parsed.event === lastEvent) {
    lastEventCount++;

    return;
  } else {
    if (lastEventCount) {
      console.log(timeString(lastDate), lastEvent, "x", lastEventCount);

      if (fileStreamCount) {
        const str = "".concat(
          timeString(lastDate),
          lastEvent,
          " x ",
          lastEventCount + "\n"
        );
        if (fileStreamCountReady) {
          fileStreamCount.write(str);
        } else {
          cacheCount.push(str);
        }
      }
    }

    lastEventCount = 1;
    lastEvent = parsed.event;
  }
  lastDate = new Date();
});

ws.on("open", () => {
  console.log("Connected to SOS.");
});
