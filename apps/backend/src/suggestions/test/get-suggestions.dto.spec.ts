import "reflect-metadata";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { GetSuggestionsDto } from "../dto/get-suggestions.dto";
import { DishType } from "@prisma/client";

describe("GetSuggestionsDto", () => {
  it("should validate a correct DTO", async () => {
    const dto = new GetSuggestionsDto();
    dto.dishType = DishType.pho;
    dto.lat = 10.762622;
    dto.lng = 106.660172;
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail on missing coordinates", async () => {
    const dto = new GetSuggestionsDto();
    dto.dishType = DishType.pho;
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should transform string values to correct types", async () => {
    const plain = {
      dishType: "bun bo hue",
      lat: "10.762622",
      lng: "106.660172",
    };
    const dto = plainToInstance(GetSuggestionsDto, plain);
    
    expect(dto.dishType).toBe(DishType.bun_bo_hue);
    expect(typeof dto.lat).toBe("number");
    expect(dto.lat).toBe(10.762622);
    expect(typeof dto.lng).toBe("number");
    expect(dto.lng).toBe(106.660172);
  });
});
