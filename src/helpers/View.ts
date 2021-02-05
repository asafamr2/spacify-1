export interface View {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function ViewToSvgBox(view: View) {
  return `${view.x - view.width / 2} ${view.y - view.height / 2} ${
    view.width
  } ${view.height}`;
}
