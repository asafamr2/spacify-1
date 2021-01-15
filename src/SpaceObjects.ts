import { clamp } from "./helpers/maff";
import { Point } from "./helpers/Point";

export interface Size {
  width: number;
  height: number;
}
export interface Rect {
  min: Point;
  max: Point;
}

export class SpaceObject {
  constructor(public rect: Rect, public id: string) {}
}
export class Planet extends SpaceObject {}

export class SpaceText extends SpaceObject {
  public path: string;
  public saneFontSize: number;
  constructor(
    public text: string,
    center: Point,
    size: number,
    rotation: number,
    curvature: number,
    id: string
  ) {
    super(
      {
        min: new Point(center.x - size * 2, center.y - size * 2),
        max: new Point(center.x + size * 2, center.y + size * 2),
      },
      id
    );
    const startPoint = new Point(-size / 2, 0).rotate(-rotation).add(center); // y axis inverted - invert rotation
    const endPoint = new Point(size / 2, 0).rotate(-rotation).add(center);
    curvature = clamp(curvature, 0.001, 0.999999);
    const radius = size / 2 + 1 / curvature - 1;
    this.path = `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 0 1 ${endPoint.x} ${endPoint.y}`;
    const arcLength = 2 * radius * Math.asin(size / (2 * radius));
    this.saneFontSize = (2 * arcLength) / (text.length + 2);
  }
}
