import {  } from "jest";
import { Builder } from "../builder/builder";

describe("builder", () => {
  it("should be OK", () => {
    const builder = new Builder("test");
    expect(builder).toBeTruthy();
  });
});
