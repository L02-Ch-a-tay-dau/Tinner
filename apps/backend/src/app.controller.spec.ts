import { dishTypeFromApiValue, dishTypeToApiValue } from "./common/dish-type.util";

describe("dishType util", () => {
  it("converts prisma enum value to API value", () => {
    expect(dishTypeToApiValue("bun_bo_hue")).toBe("bun bo hue");
  });

  it("converts API value to prisma enum value", () => {
    expect(dishTypeFromApiValue("banh mi")).toBe("banh_mi");
  });
});
