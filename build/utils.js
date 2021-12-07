"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMiscPacket = void 0;
const sosConsts_1 = require("./sosConsts");
const isMiscPacket = ($packet) => 
//@ts-ignore
sosConsts_1.miscEvents.includes($packet.event);
exports.isMiscPacket = isMiscPacket;
