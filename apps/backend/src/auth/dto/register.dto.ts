import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { MatchesField } from "../../common/decorators/matches-field.decorator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: "Username is required" })
  @MinLength(3, { message: "Username must be at least 3 characters" })
  @MaxLength(50, { message: "Username must not exceed 50 characters" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username may only contain letters, numbers, and underscores",
  })
  username!: string;

  @IsEmail({}, { message: "Email must be a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  @MaxLength(255, { message: "Email must not exceed 255 characters" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(128, { message: "Password must not exceed 128 characters" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "Password must contain at least one letter and one number",
  })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Please confirm your password" })
  @MatchesField("password", { message: "Passwords do not match" })
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Full name must not be blank" })
  @MaxLength(255, { message: "Full name must not exceed 255 characters" })
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()\u002e]{7,20}$/, {
    message: "Phone number is invalid",
  })
  phone?: string;
}
