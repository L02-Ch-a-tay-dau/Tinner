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
  @IsNotEmpty({ message: "Vui lòng nhập tên đăng nhập" })
  @MinLength(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" })
  @MaxLength(50, { message: "Tên đăng nhập không được vượt quá 50 ký tự" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới",
  })
  username!: string;

  @IsEmail({}, { message: "Email phải đúng định dạng" })
  @IsNotEmpty({ message: "Vui lòng nhập email" })
  @MaxLength(255, { message: "Email không được vượt quá 255 ký tự" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Vui lòng nhập mật khẩu" })
  @MinLength(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
  @MaxLength(128, { message: "Mật khẩu không được vượt quá 128 ký tự" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "Mật khẩu phải có ít nhất một chữ số",
  })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Vui lòng xác nhận mật khẩu" })
  @MatchesField("password", { message: "Mật khẩu xác nhận không khớp" })
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Họ tên không được để trống" })
  @MaxLength(255, { message: "Họ tên không được vượt quá 255 ký tự" })
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()\u002e]{7,20}$/, {
    message: "Số điện thoại không hợp lệ",
  })
  phone?: string;
}
