import CPlanet from "./svg/PlanetSvg.svelte";
import CSpaceText from "./svg/SpacetextSvg.svelte";
import PlanetInfo from "./info/Planet.svelte";
import ProductInfo from "./info/Product.svelte";

import type { SpaceObject } from "../../../space-data/schema/schema";

export function SpaceObjectToSvgComponent(so: SpaceObject) {
  if (so.type === "scenetext") {
    return CSpaceText; 
  } else {
    return CPlanet;
  }
}


export function SpaceObjectToInfoTemplate(so: SpaceObject) {
  if (so.type === "planet") {
    return PlanetInfo;
  } else if(so.type === "product"){
    return ProductInfo;
  } else {
    return null;
  }
}
