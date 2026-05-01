import { DishType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsUUID } from "class-validator";
import { dishTypeFromApiValue } from "../../common/dish-type.util";

export class SaveRestaurantDto {
  @IsUUID("4", { message: "restaurantId must be a valid UUID" })
  restaurantId!: string;

  @Transform(({ value }) => (typeof value === "string" ? dishTypeFromApiValue(value) : value))
  @IsEnum(DishType, { message: "dishType must be a valid dish type" })
  dishType!: DishType;
}
