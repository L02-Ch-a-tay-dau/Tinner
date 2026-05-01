import { DishType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum } from "class-validator";
import { dishTypeFromApiValue } from "../../common/dish-type.util";

export class LikeDishDto {
  @Transform(({ value }) => (typeof value === "string" ? dishTypeFromApiValue(value) : value))
  @IsEnum(DishType, { message: "dishType must be a valid dish type" })
  dishType!: DishType;
}
