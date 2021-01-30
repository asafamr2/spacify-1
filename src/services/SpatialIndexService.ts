import RBush from "rbush";
import type { BBox } from "rbush";
import { Service } from "./Service";

export class SpatialIndexService extends Service {
  protected rBush: RBush<BBox & { uid: number }> = new RBush();

  setPoints(data: any) {
    this.rBush.load(data);
  }
}
