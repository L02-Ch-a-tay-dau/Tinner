import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email phải đúng định dạng" })
  @IsNotEmpty({ message: "Vui lòng nhập email" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Vui lòng nhập mật khẩu" })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "Mã thiết bị không được vượt quá 255 ký tự" })
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: "Tên thiết bị không được vượt quá 255 ký tự" })
  deviceName?: string;
}
