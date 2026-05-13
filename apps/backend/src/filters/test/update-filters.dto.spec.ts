import { validate } from "class-validator";
import { UpdateFiltersDto } from "../dto/update-filters.dto";

describe("UpdateFiltersDto", () => {
  it("should validate a correct DTO", async () => {
    const dto = new UpdateFiltersDto();
    dto.minRating = 4;
    dto.maxDistanceKm = 10;
    dto.priceRanges = ["$", "$$"];
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail on invalid price ranges", async () => {
    const dto = new UpdateFiltersDto();
    dto.priceRanges = ["invalid"];
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("priceRanges");
  });

  it("should fail on invalid rating", async () => {
    const dto = new UpdateFiltersDto();
    dto.minRating = 6; // Max is 5
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("minRating");
  });
});
