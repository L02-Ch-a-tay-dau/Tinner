import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

const VALID_PRICE_RANGES = ["$", "$$", "$$$", "$$$$"] as const;

export class UpdateFiltersDto {
  @IsOptional()
  @IsArray({ message: "cuisines must be an array" })
  @IsString({ each: true, message: "Each cuisine must be a string" })
  @ArrayMaxSize(50, { message: "cuisines must not exceed 50 items" })
  cuisines?: string[];

  @IsOptional()
  @IsArray({ message: "dietary must be an array" })
  @IsString({ each: true, message: "Each dietary item must be a string" })
  @ArrayMaxSize(20, { message: "dietary must not exceed 20 items" })
  dietary?: string[];

  @IsOptional()
  @IsArray({ message: "priceRanges must be an array" })
  @ArrayMinSize(1, { message: "priceRanges must have at least one value" })
  @ArrayMaxSize(4, { message: "priceRanges must not exceed 4 items" })
  @IsIn(VALID_PRICE_RANGES, {
    each: true,
    message: `Each price range must be one of: ${VALID_PRICE_RANGES.join(", ")}`,
  })
  priceRanges?: string[];

  @IsOptional()
  @IsNumber({}, { message: "maxDistanceKm must be a number" })
  @Min(0.5, { message: "maxDistanceKm must be at least 0.5 km" })
  @Max(50, { message: "maxDistanceKm must not exceed 50 km" })
  maxDistanceKm?: number;

  @IsOptional()
  @IsNumber({}, { message: "minRating must be a number" })
  @Min(0, { message: "minRating must be between 0 and 5" })
  @Max(5, { message: "minRating must be between 0 and 5" })
  minRating?: number;
}
