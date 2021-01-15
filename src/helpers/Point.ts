const DEG2RAD = Math.PI / 180;

export class Point {
  constructor(public x: number, public y: number) {}
  public add(p: Point) {
    return new Point(this.x + p.x, this.y + p.y);
  }
  public sub(p: Point) {
    return new Point(this.x - p.x, this.y - p.y);
  }
  public static zero() {
    return new Point(0, 0);
  }

  /**
   * rotate clockwise
   **/
  public rotate(deg: number) {
    const [c, s] = [Math.cos(DEG2RAD * deg), -Math.sin(DEG2RAD * deg)]; // usually rotation is counter clockwise - note minus sine
    return new Point(this.x * c - this.y * s, this.x * s + this.y * c);
  }

  /**
   *  rotate clockwise around another point 
   **/
  public rotateAround(deg: number, center: Point) {
    return this.sub(center).rotate(deg).add(center);
  }

  public mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
