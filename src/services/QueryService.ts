import RBush from "rbush";
import type { BBox } from "rbush";
import knn from "../vendored/rbush-knn.js";
import { AsyncService } from "./Service";
import type { SpaceData } from "../../space-data/schema/data.js";
import type { SpaceObject } from "../../space-data/schema/schema.js";
import { Deferred } from "../helpers/Deferred.js";

class _QueryService {
  protected rBush: RBush<BBox & { uid: string }>;
  protected fullData: { [uid: string]: SpaceObject } = {};
  protected _ready = new Deferred<void>();
  constructor(data: SpaceData) {
    this.rBush = new RBush<BBox & { uid: string }>().fromJSON(data.spatial);
    this.fullData = data.objects;
    this._ready.resolve();
  }

  async ready() {
    await this._ready.promise;
  }

  getSpaceObjectByUid(uid: string): SpaceObject | undefined {
    return this.fullData[uid] ;
  }

  getClosest(x: number, y: number): string {
    return knn(this.rBush, x, y, 1)[0].uid;
  }

  getObjectsInBox(box: BBox): string[] {
    return this.rBush.search(box).map((x) => x.uid);
  }
}

export const QueryService = AsyncService.from(_QueryService);
