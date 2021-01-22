import { Point, PointOp } from "./Point";
import "ts-jest"; // for types

it("rotate 90 deg", () => {
  const p: Point = { x: 0, y: 1 };
  PointOp.doInline(p).rotate(90);
  expect(p.x).toBeCloseTo(1);
  expect(p.y).toBeCloseTo(0);
});

it("sub", () => {
  const newp = PointOp.onClone({ x: 4, y: 7 }).sub({ x: 1.8, y: -4.5 }).value();
  expect(newp.x).toBeCloseTo(2.2);
  expect(newp.y).toBeCloseTo(11.5);
});

it("add", () => {
  const newp = PointOp.onClone({ x: 4, y: 7 }).add({ x: 1.8, y: -4.5 }).value();
  expect(newp.x).toBeCloseTo(5.8);
  expect(newp.y).toBeCloseTo(2.5);
});

it("rotate around deg1", () => {
  const rotated = PointOp.chain((op) =>
    op.sub({ x: 2, y: 0 }).rotate(90).add({ x: 2, y: 0 })
  )({ x: 2, y: 1 });
  expect(rotated.x).toBeCloseTo(3);
  expect(rotated.y).toBeCloseTo(0);
});
