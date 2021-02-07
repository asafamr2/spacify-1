import { writable } from "svelte/store";
import type { SpaceObject } from "../../space-data/schema/schema";
// import { SafelyUndefined } from "../helpers/interfaces";
import { QueryService } from "./QueryService";
import { Service, ServiceType } from "./Service";
import { UrlManager } from "./UrlManager";

class _SelectionManager {
  protected currentSelection: SpaceObject | null = null;
  protected urlManager = UrlManager.getInstance();
  public selectedStore = writable<SpaceObject | null>(null);
  // protected queryService = SafelyUndefined<ServiceType<typeof QueryService>>();
  protected queryService: Promise<ServiceType<typeof QueryService>>;

  constructor() {
    this.urlManager.getOutsideChangesStore().subscribe((x) => {
      if (x.selected) {
        void this.queryService
          .then((qs) => qs.getSpaceObjectByUid(x.selected))
          .then((x) => this.set(x ?? null));
      } else {
        this.set(null);
      }
    });
    this.queryService = QueryService.getAsyncInstance();
  }

  async ready() {
    // await this.qsPromise;
  }

  unset() {
    this.set(null);
  }

  set(so: SpaceObject | null) {
    this.currentSelection = so;
    this.selectedStore.set(so);
    this.urlManager.update(
      { selected: so !== null ? `${so.category}/${so.uid}` : null },
      true
    );
  }

  getCurrent(): SpaceObject | null {
    return this.currentSelection;
  }
}

export const SelectionManager = Service.from(_SelectionManager);
