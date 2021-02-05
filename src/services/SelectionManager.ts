import { writable } from "svelte/store";
import { Service } from "./Service";
import type { SpaceObject } from "../../space-data/schema/schema.js";

export class SelectionManager extends Service {
  protected currentSelection: SpaceObject | null = null;
  public selectedStore = writable<SpaceObject | null>(null);

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
