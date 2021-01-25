import CPlanet from "./planet.svelte";
import CSpaceText from "./spacetext.svelte";

import type { SpaceObject } from "../../../space-data/schema/schema";

export function SpaceObjectToSvgComponent(so: SpaceObject) {
  if (so.type === "scenetext") {
    return CSpaceText;
  } else {
    return CPlanet;
  }
}
