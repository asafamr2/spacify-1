import RBush from "rbush";
import type { BBox } from "rbush";
import { SafelyUndefined } from "../helpers/interfaces";
import knn from "../vendored/rbush-knn.js";
import { AsyncService } from "./Service";
import type { SpaceData } from "../../space-data/schema/data.js";
import type { Drilldown, SpaceObject } from "../../space-data/schema/schema.js";

class _QueryService {
  protected rBush = SafelyUndefined<RBush<BBox & { uid: string }>>();
  protected objects: { [uid: string]: SpaceObject } = {};
  protected _ready: Promise<void>;
  protected fetcher = new NetworkFetcher();
  constructor(_: any) {
    this._ready = this.fetcher.getMainView().then((resp) => {
      this.rBush = new RBush<BBox & { uid: string }>().fromJSON(resp.spatial);
      this.objects = resp.objects;
    });
  }

  async ready() {
    return this._ready;
  }
  async getDrilldown(so: SpaceObject) {
    return this.fetcher.getDrilldown(so);
  }

  getSpaceObjectByUid(uid: string): SpaceObject | null {
    return this.objects[uid] ?? null;
  }

  getClosest(x: number, y: number,k=1): SpaceObject[]  {
    return knn(this.rBush, x, y, k).map((x) => this.objects[x.uid]);
  }

  getObjectsInBox(box: BBox): SpaceObject[] {
    return this.rBush.search(box).map((x) => this.objects[x.uid]);
  }
}

class NetworkFetcher {
  constructor() {}
  protected async fetch(jsonUrl: string) {
    return fetch(jsonUrl).then((resp) => resp.json());
  }
  async getMainView(this: this) {
    return this.fetch("/build/content/main_content.json") as Promise<SpaceData>;
  }
  async getDrilldown(this: this, so: SpaceObject) {
    return this.fetch(
      `/build/content/${so.category}/${so.uid}.json`
    ) as Promise<Drilldown>;
  }
}

export const QueryService = AsyncService.from(_QueryService);
void QueryService.build({});
