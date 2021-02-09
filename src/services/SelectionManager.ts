import { writable } from "svelte/store";
import type { SpaceObject } from "../../space-data/schema/schema";
// import { SafelyUndefined } from "../helpers/interfaces";
import { QueryService } from "./QueryService";
import { ViewportService } from "./ViewportService";
import { Service } from "./Service";

class _SelectionManager {
  protected currentSelection: SpaceObject | null = null;
  public selectedStore = writable<SpaceObject | null>(null);
  // protected queryService = SafelyUndefined<ServiceType<typeof QueryService>>();

  constructor() {
    

    window._dsoSelect = (fuid: string, width?: number) => {
      void QueryService.getAsyncInstance().then((qs) =>
        {const so =qs.getSpaceObjectByUid(fuid);
          if(fuid && !so)console.error('Could not find planet '+fuid)
        this.set(so ?? null)}
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
  }

  getCurrent(): SpaceObject | null {
    return this.currentSelection;
  }
}

export const SelectionManager = Service.from(_SelectionManager);

declare global {
  interface Window {
    _dsoSelect: (fuid: string, width?: number) => void;
  }
}
