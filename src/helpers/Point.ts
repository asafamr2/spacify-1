
const DEG2RAD = Math.PI / 180;
export interface Point {
  x: number;
  y: number;
}

export class PointOp {

  protected constructor(protected point: Point) {}

  public static onClone(p: Point) {
    return new PointOp({ ...p });
  }
  public static doInline(p: Point) {
    return new PointOp(p);
  }
  // public static ONE() {
  //   return new PointOp({ x: 1, y: 1 });
  // }
  // public static ZERO() {
  //   return new PointOp({ x: 0, y: 0 });
  // }

  public static chain(opCb: (po: PointOp) => PointOp): (p: Point) => Point {
    return (p: Point) => {
      const pop = opCb(PointOp.onClone(p));
      return pop.value();
    };
  }
  public value(): Point {
    return this.point;
  }

  public add(this: PointOp, other: Point) {
    this.point.x += other.x;
    this.point.y += other.y;
    return this;
  }

  public sub(this: PointOp, other: Point) {
    this.point.x -= other.x;
    this.point.y -= other.y;
    return this;
  }
  /***
   * clockwise rotation in y upwards, x rightwards in degrees 
   */
  public rotate(this: PointOp, deg: number) {
    const [c, s] = [Math.cos(DEG2RAD * deg), -Math.sin(DEG2RAD * deg)];
    const current = {...this.point}
    this.point.x = current.x * c - current.y * s
    this.point.y = current.x * s + current.y * c 
    return this;
  }
}

