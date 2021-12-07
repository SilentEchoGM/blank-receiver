import { miscEvents } from "./sosConsts";
import { SOS } from "./sosPluginEvents";

export const isMiscPacket = ($packet: SOS.Packet): $packet is SOS.GameMisc =>
  //@ts-ignore
  miscEvents.includes($packet.event);
