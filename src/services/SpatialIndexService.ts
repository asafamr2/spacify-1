import RBush from "rbush";
import type { BBox } from "rbush";
import knn from "../vendored/rbush-knn.js";
import { Service } from "./Service";

export class SpatialIndexService extends Service {
  protected rBush: RBush<BBox & { uid: string }> = new RBush();

  setPoints(data: any) {
    this.rBush = this.rBush.fromJSON(data);
  }

  getClosest(x: number, y: number): string {
    return knn(this.rBush, x, y, 1)[0].uid;
  }

  getObjectsInBox(box: BBox): string[] {
    return this.rBush.search(box).map((x) => x.uid);
  }
}
