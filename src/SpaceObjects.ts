import { clamp } from "./helpers/maff";
import { Point, PointOp } from "./helpers/Point";


const serializables = new Map<string, any>();

export abstract class SpaceObject {
  public abstract id: string;
  constructor() {}
  public static fromParsedJson(obj: any): SpaceObject {
    Object.setPrototypeOf(obj, serializables.get(obj._sot))
    return obj;
  }
  protected abstract getBoundingRect(
    this: this
  ): { x: number; y: number; width: number; height: number };
}

function serializableSO<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  const soType = constructor.name;
  let SerializableSO = class extends constructor {
    _sot = soType;
  };
  serializables.set(soType, SerializableSO.prototype);
  return SerializableSO;
}

@serializableSO
export class Planet extends SpaceObject {
  protected getBoundingRect(
    this: this
  ): { x: number; y: number; width: number; height: number } {
    return {
      x: this.center.x - this.radius,
      y: this.center.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }
  constructor(public center: Point, public radius: number, public id: string) {
    super();
  }
}

@serializableSO
export class SpaceText extends SpaceObject {
  public path: string;
  public saneFontSize: number; // One day this might be in a svelte comp or some visitor

  protected getBoundingRect(
    this: this
  ): { x: number; y: number; width: number; height: number } {
    return {
      x: this.center.x - this.size * 1,
      y: this.center.y - this.size * 1,
      width: this.size * 2,
      height: this.size * 2,
    };
  }

  constructor(
    public text: string,
    public center: Point,
    public size: number,
    public rotation: number,
    public curvature: number,
    public id: string
  ) {
    super();
    const rotateOp = PointOp.chain((op) => op.rotate(-rotation).add(center)); // y axis inverted - invert rotation
    const startPoint = rotateOp({ x: -size / 2, y: 0 });
    const endPoint = rotateOp({ x: +size / 2, y: 0 });
    curvature = clamp(curvature, 0.001, 0.999999);
    const radius = size / 2 + 1 / curvature - 1;
    this.path = `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 0 1 ${endPoint.x} ${endPoint.y}`;
    const arcLength = 2 * radius * Math.asin(size / (2 * radius));
    this.saneFontSize = (2 * arcLength) / (text.length + 2);
  }
}
