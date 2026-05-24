import { Body, Controller, Get, Ip, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto, @Ip() ip: string, @Req() req: Request) {
    return this.authService.login(dto, {
      ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post("logout")
  logout(@CurrentUser() user: { sub: string }, @Body() dto: LogoutDto) {
    return this.authService.logout(user.sub, dto.refreshToken);
  }

  @Get("me")
  me(@CurrentUser() user: { sub: string }) {
    return this.authService.me(user.sub);
  }
}
