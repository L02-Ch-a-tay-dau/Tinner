import { categorizeCuisine } from "./cuisine-category.util";

describe("categorizeCuisine", () => {
  it("maps japanese-related tags to the official Japanese category", () => {
    expect(categorizeCuisine("japanese")).toBe("Đồ ăn Nhật Bản");
    expect(categorizeCuisine("japanese_ramen")).toBe("Đồ ăn Nhật Bản");
    expect(categorizeCuisine("sushi")).toBe("Đồ ăn Nhật Bản");
  });

  it("normalizes common vietnamese dish tags to semantic categories", () => {
    expect(categorizeCuisine("pho_bo")).toBe("Phở");
    expect(categorizeCuisine("bun_bo_hue")).toBe("Bún");
    expect(categorizeCuisine("banh_mi")).toBe("Bánh mì");
  });

  it("handles delimiters and spacing when parsing combined cuisine tags", () => {
    expect(categorizeCuisine("unknown_tag; korean barbecue")).toBe("Đồ ăn Hàn Quốc");
    expect(categorizeCuisine("foo | coffee shop")).toBe("Cafe");
  });

  it("returns fallback category for unknown tags", () => {
    expect(categorizeCuisine("totally_unknown_tag")).toBe("Khác");
    expect(categorizeCuisine(null)).toBe("Khác");
  });
});
