export interface View {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function ViewToSvgBox(view: View) {
  return `${view.x} ${view.y} ${view.width} ${view.height}`;
}
