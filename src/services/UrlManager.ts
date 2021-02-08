/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Readable, Writable, writable } from "svelte/store";
import { Service } from "./Service";
import { debounce } from "../helpers/functional";
import { ViewportService } from "./ViewportService";
import { SelectionManager } from "./SelectionManager";
import { QueryService } from "./QueryService";
import type { SpaceObject } from "../../space-data/schema/schema";

const LOCATION_DEBOUNCE_MS = 1000;

function getHashParams(): Record<string, string> {
  const ret: Record<string, string> = {};
  for (const keqv of window.location.hash.substr(1).split("&")) {
    try {
      const spl = keqv.split("=");
      if (spl.length === 2) {
        ret[decodeURI(spl[0])] = decodeURI(spl[1]);
      }
    } catch (e) {
      console.log("Could not parse hash property " + keqv);
    }
  }
  return ret;
}

type UrlParams = { selected?: string; x?: string; y?: string; width?: string };
type StateParams = {
  params: UrlParams;
  revision: number;
};
function shallowEq(
  obj1: Record<string, string | undefined>,
  obj2: Record<string, string | undefined>
) {
  return (
    Object.entries(obj1).sort().toString() ===
    Object.entries(obj2).sort().toString()
  );
}
function getFuid(so: SpaceObject) {
  return so.category + "/" + so.uid;
}

class _UrlManager {
  protected currentParams: UrlParams;
  protected locationUpdates: Writable<UrlParams>;
  protected revision = 0;

  public hasBack() {
    return this.revision > 1;
  }

  constructor() {
    this.currentParams = getHashParams() as UrlParams;
    if (Object.keys(this.currentParams).length > 0) {
      this.revision++; // if we started with hash params we can go back to the first load
    }
    this.updateViewport();
    this.locationUpdates = writable<UrlParams>(this.currentParams);

    void ViewportService.getAsyncInstance().then((vs) => {
      vs.getViewportStore().subscribe((newView) => {
        if (this.currentParams.selected) return;
        this.debouncedUpdate({
          x: newView.x.toFixed(2),
          y: newView.y.toFixed(2),
          width: newView.width.toFixed(2),
        });
      });
    });

    SelectionManager.getInstance().selectedStore.subscribe((selected) => {
      if (
        (selected === null && this?.currentParams?.selected) || // unselection
        (selected !== null &&
          getFuid(selected) !== this?.currentParams?.selected)
      ) {
        this.debouncedUpdate.immediately({
          ...this.currentParams,
          selected: selected === null ? undefined : getFuid(selected),
        });
      }
    });

    window.addEventListener(
      "popstate",
      (e: PopStateEvent) => {
        const state = e.state as StateParams;
        const params = state?.params ?? (getHashParams() as UrlParams);
        const revision = state?.revision ?? 0;
        this.revision = revision;
        this.currentParams = params;
        this.locationUpdates.set(params);

        void QueryService.getAsyncInstance().then((qs) =>
          SelectionManager.getInstance().set(
            params.selected ? qs.getSpaceObjectByUid(params.selected) : null
          )
        );

        this.updateViewport();
      },
      false
    );
  }
  protected updateViewport() {
    if (
      (this.currentParams.x && this.currentParams.y) ||
      this.currentParams.width
    ) {
      void ViewportService.getAsyncInstance().then((vs) => {
        if (this.currentParams.x && this.currentParams.y) {
          vs.moveTo({
            x: parseFloat(this.currentParams.x),
            y: parseFloat(this.currentParams.y),
          });
        }
        if (this.currentParams.width) {
          vs.setWidth(parseFloat(this.currentParams.width));
        }
      });
    }
  }

  protected filterKeys(obj: Record<string, string>, keys: string[]) {
    const filtered: Record<string, string> = {};
    let ret = null;
    for (const key of keys) {
      if (obj[key] !== undefined) {
        filtered[key] = obj[key];
        ret = filtered;
      }
    }
    return ret;
  }

  protected updateLocationHash(obj: Record<string, string>) {
    if (shallowEq(obj, this.currentParams)) return;
    const hash = Object.entries(obj)
      .filter(([_, val]) => val)
      .map(([key, val]) => encodeURI(key) + "=" + encodeURI(val))
      .join("&");
    this.currentParams = obj;
    this.revision++;
    history.pushState(
      <StateParams>{ revision: this.revision, params: obj },
      "",
      "#" + hash
    );
    this.locationUpdates.set(obj);
  }

  // getOutsideChangesStore(): Readable<Record<string, string>> {
  //   return this.locationOutsideUpdates as Readable<Record<string, string>>;
  // }
  getChangesStore(): Readable<UrlParams> {
    return this.locationUpdates as Readable<UrlParams>;
  }

  protected debouncedUpdate = debounce(
    LOCATION_DEBOUNCE_MS,
    (vals: UrlParams) => {
      this.updateLocationHash(vals as Record<string, string>);
    }
  );

  // public update(vals: Record<string, string | null>, fast = false) {
  //   console.log('upd',new Error(''))
  //   const newVals = { ...this.currentParams };
  //   for (const key of Object.keys(vals)) {
  //     if (vals[key] !== null) {
  //       newVals[key] = vals[key] as string;
  //     } else {
  //       delete newVals[key];
  //     }
  //   }
  //   if (fast) this.debouncedUpdateFast(newVals);
  //   else this.debouncedUpdateSlow(newVals);
  // }
}

export const UrlManager = Service.from(_UrlManager);
