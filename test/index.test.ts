import { expect, test } from "vitest";
import { add } from "../src";

test("creates a user with the correct fields", () => {
  const value = add(1, 30);

  expect(value).toEqual(31);
});
