import type { SpaceObject } from "../../space-data/schema/schema";

export interface PinParams {
  x: number;
  y: number;
  relx: number;
  rely: number;
  isChooseCms: boolean;
  closests: SpaceObject[];
}
