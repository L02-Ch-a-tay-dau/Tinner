import { IsJWT, IsNotEmpty } from "class-validator";

export class LogoutDto {
  @IsNotEmpty({ message: "Refresh token is required" })
  @IsJWT({ message: "Refresh token must be a valid JWT" })
  refreshToken!: string;
}
