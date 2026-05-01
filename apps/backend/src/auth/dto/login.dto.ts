import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email must be a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "Device ID must not exceed 255 characters" })
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "Device name must not exceed 255 characters" })
  deviceName?: string;
}
