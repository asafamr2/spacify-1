import { Planet, SpaceObject, SpaceText } from "./SpaceObjects";
import "ts-jest";

it("serialize deserialize", () => {
  const obj = new SpaceText("aaa", { x: 1, y: 1 }, 3, 10, 10, "asd");
  expect(obj).toBeInstanceOf(SpaceText);
  const reparsed = JSON.parse(JSON.stringify(obj));
  expect(reparsed).not.toBeInstanceOf(SpaceText);
  const obj2 = SpaceObject.fromParsedJson(reparsed);
  expect(obj2).toBeInstanceOf(SpaceText);
});
