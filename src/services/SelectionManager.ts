import { writable } from "svelte/store";
import type { SpaceObject } from "../../space-data/schema/schema";
// import { SafelyUndefined } from "../helpers/interfaces";
import { QueryService } from "./QueryService";
import { ViewportService } from "./ViewportService";
import { Service } from "./Service";
import { UrlManager } from "./UrlManager";

class _SelectionManager {
  protected currentSelection: SpaceObject | null = null;
  protected urlManager = UrlManager.getInstance();
  public selectedStore = writable<SpaceObject | null>(null);
  // protected queryService = SafelyUndefined<ServiceType<typeof QueryService>>();

  constructor() {
    this.urlManager.getOutsideChangesStore().subscribe((x) => {
      if (x.selected) {
        void QueryService.getAsyncInstance()
          .then((qs) => qs.getSpaceObjectByUid(x.selected))
          .then((x) => this.set(x ?? null));
      } else {
        this.set(null);
      }
    });

    window.focusViewportOn = (fuid: string, width?: number) => {
      void QueryService.getAsyncInstance().then((qs) =>
        this.set(qs.getSpaceObjectByUid(fuid) ?? null)
      );
      if (width) {
        void ViewportService.getAsyncInstance().then((vs) =>
          vs.setWidth(width)
        );
      }
    };
  }

  unset() {
    this.set(null);
  }

  set(so: SpaceObject | null) {
    this.currentSelection = so;
    this.selectedStore.set(so);
    this.urlManager.update(
      { selected: so !== null ? so.category+'/'+so.uid : null },
      true
    );
  }

  getCurrent(): SpaceObject | null {
    return this.currentSelection;
  }
}

export const SelectionManager = Service.from(_SelectionManager);

declare global {
  interface Window {
    focusViewportOn: (fuid: string, width?: number) => void;
  }
}
