import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { LikeDishDto } from "../dto/like-dish.dto";
import { SaveRestaurantDto } from "../dto/save-restaurant.dto";
import { DishType } from "@prisma/client";

describe("Interactions DTOs", () => {
  describe("LikeDishDto", () => {
    it("should validate a correct DTO", async () => {
      const dto = new LikeDishDto();
      dto.dishType = DishType.bun_bo_hue;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should transform dishType from string", async () => {
      const plain = { dishType: "bun bo hue" };
      const dto = plainToInstance(LikeDishDto, plain);
      expect(dto.dishType).toBe(DishType.bun_bo_hue);
    });

    it("should fail on missing dishType", async () => {
      const dto = new LikeDishDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("SaveRestaurantDto", () => {
    it("should validate a correct DTO", async () => {
      const dto = new SaveRestaurantDto();
      dto.dishType = DishType.bun_bo_hue;
      dto.restaurantId = "550e8400-e29b-41d4-a716-446655440000";
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should transform dishType from string", async () => {
      const plain = { restaurantId: "550e8400-e29b-41d4-a716-446655440000", dishType: "bun bo hue" };
      const dto = plainToInstance(SaveRestaurantDto, plain);
      expect(dto.dishType).toBe(DishType.bun_bo_hue);
    });

    it("should fail on missing restaurantId", async () => {
      const dto = new SaveRestaurantDto();
      dto.dishType = "pho" as DishType;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
