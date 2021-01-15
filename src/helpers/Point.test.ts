import {Point} from "./Point";
import "ts-jest"; // for types

it("rotate 90 deg", () => {
  const rotated = new Point(0, 1).rotate(90);
  expect(rotated.x).toBeCloseTo(1);
  expect(rotated.y).toBeCloseTo(0);
});

it("sub", () => {
  const rotated = new Point(4, 7).sub(new Point(1.8, -4.5));
  expect(rotated.x).toBeCloseTo(2.2);
  expect(rotated.y).toBeCloseTo(11.5);
});

it("add", () => {
  const rotated = new Point(4, 7).add(new Point(1.8, -4.5));
  expect(rotated.x).toBeCloseTo(5.8);
  expect(rotated.y).toBeCloseTo(2.5);
});

it("rotate around deg1", () => {
  const rotated = new Point(2, 1).rotateAround(90, new Point(2,0));
  expect(rotated.x).toBeCloseTo(3);
  expect(rotated.y).toBeCloseTo(0);
});

it("rotate around deg", () => {
  const rotated = new Point(-0.76, 1.51).rotateAround(-40, new Point(1.37, 0.9));
  expect(rotated.x).toBeCloseTo(-0.65377);
  expect(rotated.y).toBeCloseTo(0);
});
