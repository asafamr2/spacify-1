import { clamp, smoothstep, strHash } from "./maff";
import "ts-jest";

it("clamps", () => {
  expect(clamp(12, 3, 5)).toBeCloseTo(5);
  expect(clamp(0.7, 0, 1)).toBeCloseTo(0.7);
  expect(clamp(0.8, -1, 0.6)).toBeCloseTo(0.6);
  expect(clamp(-2, -1, 0.6)).toBeCloseTo(-1);
});

it("smoothstep", () => {
  expect(smoothstep(0, 0.5, 1)).toBeCloseTo(1);
  expect(smoothstep(0, 0.5, 0.25)).toBeCloseTo(0.5);
  expect(smoothstep(100, 200, 150)).toBeCloseTo(0.5);
  expect(smoothstep(200, 100, 100)).toBeCloseTo(1);
  expect(smoothstep(200, 100, 200)).toBeCloseTo(0);
});


it("strHash", () => {
  expect(strHash("M 2.8397459621556127 16.5 A 12.333333333333334 12.333333333333334 0 0 1 20.16025403784439 6.500000000000001")).toBe('1p2l28n');
 
});
