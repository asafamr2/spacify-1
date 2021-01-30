/**
 * @description Unique and short identifier used to reference this object.
 * @pattern "^[a-z0-9\/]*$"
 */
export type uid = string;

type SOTag = "LEADER" | "OPEN_SOURCE" | "FREE" | "TRENDING";

interface relation {
  ref: uid;
}

interface common_props {
  /**
   * for json schema
   */
  $schema?: string;

  /**
   * @ignore
   */
  uid: uid;

  tags?: SOTag[];

  /**
   * @description displayed in viewport and popup
   */
  title?: string;

  /**
   * @ignore
   */
  markdown: string;

  position: {
    x: number;
    y: number;
  };

  /**
   * @pattern "^https://en\\.wikipedia\\.org/.*"
   */
  wiki?: string;

  /**
   * @pattern "^https://github\\.com/.*"
   */
  github?: string;

  stackoverflow_tag?: string;

  relations?: relation[];
}
/**
 * @additionalProperties false
 */
export interface Concept extends common_props {
  type: "concept";
}
/**
 * @additionalProperties false
 */
export interface Product extends common_props {
  type: "product";
}

/**
 * @additionalProperties false
 */
export interface SceneText extends common_props {
  type: "scenetext";
  size: number;
  text: string;

  /**
   * @description 1 for max. curvature, 0 means text follow a straight line
   * @maximum 1
   * @minimum 0
   */

  arc: number;
  /**
   * @description clockwise rotation in degrees (-180,180)
   * @maximum 180
   * @minimum -180
   */
  rotation: number;
}

export type SpaceObject = SceneText | Concept | Product;
