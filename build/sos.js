"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const utils_1 = require("./utils");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
console.log("Starting...");
const ws = new ws_1.default("ws://localhost:49122");
const timeString = (date = new Date()) => {
    return `${date.toISOString()}: `;
};
let lastEventCount = 0;
let lastEvent = "";
let lastDate = new Date();
let gameId = "";
let fileStream = null;
let fileStreamReady = false;
const cache = [];
ws.on("message", (data) => {
    const parsed = JSON.parse(data.toString());
    if ((0, utils_1.isMiscPacket)(parsed)) {
        if (parsed.data.match_guid !== gameId) {
            console.log("NEW GAME");
            if (fileStream) {
                fileStream.close();
                fileStream = null;
            }
            gameId = parsed.data.match_guid;
            const path = (0, path_1.join)(__dirname, "..", "out", gameId + ".game");
            fileStream = fs_extra_1.default.createWriteStream(path);
            fileStream.on("open", () => {
                fileStreamReady = true;
                cache.forEach((str) => {
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
    }
    else {
        if (lastEventCount) {
            console.log(timeString(lastDate), lastEvent, "x", lastEventCount);
            if (fileStream) {
                const str = "".concat(timeString(lastDate), lastEvent, " x ", lastEventCount + "\n");
                if (fileStreamReady) {
                    fileStream.write(str);
                }
                else {
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
