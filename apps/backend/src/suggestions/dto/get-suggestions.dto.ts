import { DishType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsNumber, Max, Min } from "class-validator";
import { dishTypeFromApiValue } from "../../common/dish-type.util";

export class GetSuggestionsDto {
  @Transform(({ value }) => (typeof value === "string" ? dishTypeFromApiValue(value) : value))
  @IsEnum(DishType, { message: "dishType must be a valid dish type" })
  dishType!: DishType;

  @Type(() => Number)
  @IsNumber({}, { message: "lat must be a number" })
  @Min(-90, { message: "lat must be between -90 and 90" })
  @Max(90, { message: "lat must be between -90 and 90" })
  lat!: number;

  @Type(() => Number)
  @IsNumber({}, { message: "lng must be a number" })
  @Min(-180, { message: "lng must be between -180 and 180" })
  @Max(180, { message: "lng must be between -180 and 180" })
  lng!: number;
}
