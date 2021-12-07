import WebSocket from "ws";
import { SOS } from "./sosPluginEvents";
import { isMiscPacket } from "./utils";
import fs from "fs-extra";
import { join } from "path";

console.log("Starting...");

const ws = new WebSocket("ws://localhost:49122");

const timeString = (date = new Date()) => {
  return `${date.toISOString()}: `;
};

let lastEventCount = 0;
let lastEvent = "";
let lastDate = new Date();
let gameId = "";
let fileStream: fs.WriteStream | null = null;
let fileStreamReady = false;
const cache: string[] = [];

ws.on("message", (data) => {
  const parsed: SOS.Packet = JSON.parse(data.toString());

  if (isMiscPacket(parsed)) {
    if (parsed.data.match_guid !== gameId) {
      console.log("NEW GAME");
      if (fileStream) {
        fileStream.close();
        fileStream = null;
      }
      gameId = parsed.data.match_guid;
      const path = join(__dirname, "..", "out", gameId + ".game");
      fileStream = fs.createWriteStream(path);
      fileStream.on("open", () => {
        fileStreamReady = true;
        cache.forEach((str: string) => {
          if (!fileStream) {
            throw new Error("This error should never happen.");
          }
          fileStream.write(str);
        });
        cache.length = 0;
      });
      fileStream.on("close", () => {
        fileStreamReady = false;
      });
    }
  }

  if (parsed.event === lastEvent) {
    lastEventCount++;

    return;
  } else {
    if (lastEventCount) {
      console.log(timeString(lastDate), lastEvent, "x", lastEventCount);

      if (fileStream) {
        const str = "".concat(
          timeString(lastDate),
          lastEvent,
          " x ",
          lastEventCount + "\n"
        );
        if (fileStreamReady) {
          fileStream.write(str);
        } else {
          cache.push(str);
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
