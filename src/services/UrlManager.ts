/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Readable, Writable, writable } from "svelte/store";
import { Service } from "./Service";
import { debounce } from "../helpers/functional";
const LOCATION_DEBOUNCE_SLOW_MS = 1000;
const LOCATION_DEBOUNCE_FAST_MS = 50;

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

type StateParams = {
  params: Record<string, string>;
  revision: number;
};
function shallowEq(obj1: Record<string, string>, obj2: Record<string, string>) {
  return (
    Object.entries(obj1).sort().toString() ===
    Object.entries(obj2).sort().toString()
  );
}




class _UrlManager {
  protected currentParams: Record<string, string>;
  protected locationOutsideUpdates: Writable<Record<string, string>>;
  protected locationAllUpdates: Writable<Record<string, string>>;
  protected revision = 0;

  public hasBack() {
    return this.revision > 1;
  }

  constructor() {
    this.currentParams = getHashParams();
    if (Object.keys(this.currentParams).length > 0) {
      this.revision++;
    }
    this.locationOutsideUpdates = writable<Record<string, string>>(
      this.currentParams
    );
    this.locationAllUpdates = writable<Record<string, string>>(
      this.currentParams
    );

    window.addEventListener(
      "popstate",
      (e: PopStateEvent) => {
        const state = e.state as StateParams;
        const params = state?.params ?? getHashParams();
        const revision = state?.revision ?? 0;
        this.revision = revision;
        this.currentParams = params;
        this.locationOutsideUpdates.set(params);
        this.locationAllUpdates.set(params);
      },
      false
    );
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
      .map(([key, val]) => encodeURI(key) + "=" + encodeURI(val))
      .join("&");
    this.currentParams = obj;
    this.revision++;
    history.pushState(
      <StateParams>{ revision: this.revision, params: obj },
      "",
      "#" + hash
    );
    this.locationAllUpdates.set(obj);
  }

  getOutsideChangesStore(): Readable<Record<string, string>> {
    return this.locationOutsideUpdates as Readable<Record<string, string>>;
  }
  getAllChangesStore(): Readable<Record<string, string>> {
    return this.locationAllUpdates as Readable<Record<string, string>>;
  }

  protected updateNow = (vals: Record<string, string>) => {
    this.updateLocationHash(vals);
  };
  protected debouncedUpdateSlow = debounce(LOCATION_DEBOUNCE_SLOW_MS, this.updateNow);
  protected debouncedUpdateFast = debounce(LOCATION_DEBOUNCE_FAST_MS, this.updateNow);

  public update(vals: Record<string, string | null>, fast = false) {
    const newVals = { ...this.currentParams };
    for (const key of Object.keys(vals)) {
      if (vals[key] !== null) {
        newVals[key] = vals[key] as string;
      } else {
        delete newVals[key];
      }
    }
    if (fast) this.debouncedUpdateFast(newVals);
    else this.debouncedUpdateSlow(newVals);
  }
}

export const UrlManager = Service.from(_UrlManager);
