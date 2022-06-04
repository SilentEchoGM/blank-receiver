"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
const ws_1 = __importDefault(require("ws"));
const utils_1 = require("./utils");
console.log("Starting...");
const ws = new ws_1.default("ws://localhost:49122");
const timeString = (date = new Date()) => {
    return `${date.toISOString()}: `;
};
let lastEventCount = 0;
let lastEvent = "";
let lastDate = new Date();
let gameId = "";
let fileStreamCount = null;
let fileStreamCountReady = false;
let fileStreamPackets = null;
let fileStreamPacketsReady = false;
const cacheCount = [];
const cachePackets = [];
ws.on("message", (data) => {
    const parsed = JSON.parse(data.toString());
    if ((0, utils_1.isMiscPacket)(parsed)) {
        if (parsed.data.match_guid !== gameId) {
            console.log(`NEW GAME`);
            if (fileStreamCount) {
                fileStreamCount.close();
                fileStreamCount = null;
            }
            gameId = parsed.data.match_guid;
            console.log(`GAME ID: ${gameId}`);
            const countPath = (0, path_1.join)(__dirname, "..", "out", gameId + ".game");
            fileStreamCount = fs_extra_1.default.createWriteStream(countPath);
            fileStreamCount.on("open", () => {
                fileStreamCountReady = true;
                cacheCount.forEach((str) => {
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
            const packetsPath = (0, path_1.join)(__dirname, "..", "out", gameId + ".packets");
            fileStreamPackets = fs_extra_1.default.createWriteStream(packetsPath);
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
    }
    else {
        cachePackets.push(parsed);
    }
    if (parsed.event === lastEvent) {
        lastEventCount++;
        return;
    }
    else {
        if (lastEventCount) {
            console.log(timeString(lastDate), lastEvent, "x", lastEventCount);
            if (fileStreamCount) {
                const str = "".concat(timeString(lastDate), lastEvent, " x ", lastEventCount + "\n");
                if (fileStreamCountReady) {
                    fileStreamCount.write(str);
                }
                else {
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
