import { dishTypeFromApiValue, dishTypeToApiValue } from "../dish-type.util";
import { DishType } from "@prisma/client";

describe("dishType util", () => {
  describe("dishTypeToApiValue", () => {
    it("converts prisma enum value (with underscores) to API value (with spaces)", () => {
      expect(dishTypeToApiValue("bun_bo_hue" as DishType)).toBe("bun bo hue");
      expect(dishTypeToApiValue("banh_mi" as DishType)).toBe("banh mi");
    });
  });

  describe("dishTypeFromApiValue", () => {
    it("converts human-friendly string (API value) back to prisma enum value", () => {
      expect(dishTypeFromApiValue("bun bo hue")).toBe("bun_bo_hue");
      expect(dishTypeFromApiValue("banh mi")).toBe("banh_mi");
    });

    it("handles Vietnamese accents and normalization", () => {
      expect(dishTypeFromApiValue("bún bò huế")).toBe("bun_bo_hue");
      expect(dishTypeFromApiValue("BÁNH MÌ")).toBe("banh_mi");
      expect(dishTypeFromApiValue("bún đậu mắm tôm")).toBe("bun_dau");
    });

    it("handles variations and aliases", () => {
      expect(dishTypeFromApiValue("bun dau")).toBe("bun_dau");
      expect(dishTypeFromApiValue("bun rieu cua")).toBe("bun_rieu");
    });

    it("returns undefined if no match is found", () => {
      expect(dishTypeFromApiValue("unknown dish")).toBeUndefined();
    });

    it("returns undefined for non-string values", () => {
      expect(dishTypeFromApiValue(123 as any)).toBeUndefined();
      expect(dishTypeFromApiValue(null as any)).toBeUndefined();
    });
  });
});
