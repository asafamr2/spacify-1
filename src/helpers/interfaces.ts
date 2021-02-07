import type { SpaceObject } from "../../space-data/schema/schema";

export interface PinParams {
  x: number;
  y: number;
  relx: number;
  rely: number;
  isChooseCms: boolean;
  closests: SpaceObject[];
}

export function SafelyUndefined<T>() {
  return (undefined as any) as T;
}
