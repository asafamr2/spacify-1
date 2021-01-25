/**
 * @description Unique and short identifier used to reference this object.
 * @pattern "^[a-z0-9\/]*$"
 */
export type uid = string;

interface relation {
  ref: uid;
  tldr?: string;
  tldr_link?: string;
}

interface common_props {
  $schema?: string;

  /**
   * @ignore
   */
  uid: uid;

  /**
   * @description display in viewport and popup
   */
  title?: string;

  tldr?: string;

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

  similar?: relation[];

  goes_with?: relation[];
}
/**
 * @additionalProperties false
 */
export interface concept extends common_props {
  type: "concept";
}
/**
 * @additionalProperties false
 */
export interface product extends common_props {
  type: "product";

  /**
   * @ignore Github stars (in stats), sets object size
   */
  github_stars?: number;
}

/**
 * @additionalProperties false
 */
export interface sceneText extends common_props {
  type: "scenetext";
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

export type SpaceObject = sceneText | concept | product;
