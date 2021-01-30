import type { SpaceObject } from "./schema";

export type SpatialIndex = {[k:string]:unknown};

export type SpaceData = {
  objects: {[uid:string]:SpaceObject};
  spatial: SpatialIndex;
};
