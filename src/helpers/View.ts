
export class View {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) { }
  public toSvgString() {
    return `${this.x} ${this.y} ${this.width} ${this.height}`;
  }
}
