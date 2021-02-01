/**
 * @description Unique and short identifier used to reference this object.
 * @pattern ^[a-z0-9\-]*$
 */
export type uid = string;

type ProductTag = "CATEGORY_LEADER" | "OPEN_SOURCE" | "FREE" | "TRENDING";
type ConceptTag = "ADVANCED_TOPIC" | "CONCERN" ;

interface has_position {
  /**
   * @description position in space
   */
  position: {
    x: number;
    y: number;
  };
}

interface common_props {
  /**
   * for json schema
   */
  $schema?: string;

  uid: uid;

  /**
   * @description space region
   * @pattern ^[a-z0-9\-]*$
   */
  category: string;

  /**
   * @description displayed in viewport and popup
   */
  title: string;

  /**
   * @ignore
   */
  markdown?: string;

  /**
   * @description wikipedia page url
   * @pattern ^https://en\\.wikipedia\\.org/.*
   */
  wiki?: string;
}
/**
 * @additionalProperties false
 */
export interface Concept extends common_props, has_position {
  readonly type: "concept";
  tags?: ConceptTag[];
}

/**
 * @additionalProperties false
 */
export interface Product extends common_props, has_position {
  readonly type: "product";

  /**
   * @description github repo url
   * @pattern ^https://github\\.com/.*
   */
  github?: string;

  stackoverflow_tag?: string;

  tags?: ProductTag[];
}

/**
 * @additionalProperties false
 */
export interface SceneText extends common_props, has_position {
  readonly type: "scenetext";
  size: number;

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

interface Related extends common_props {
  readonly type: "related";
  parent_uid: uid;
}

interface BiRelated extends common_props {
  readonly type: "birelated";
  parent_uid: uid;
  child_uid: uid;
}

export type SpaceObject = SceneText | Concept | Product | Related | BiRelated;
