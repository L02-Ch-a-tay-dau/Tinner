import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailTaken) {
      throw new ConflictException("Email is already registered");
    }

    const usernameTaken = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (usernameTaken) {
      throw new ConflictException("Username is already taken");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
      },
    });

    await this.prisma.userFilter.create({
      data: {
        userId: user.id,
        priceRanges: ["$", "$$", "$$$", "$$$$"],
        maxDistanceKm: 5,
        minRating: 3,
      },
    });

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toUserDto(user),
      tokens,
    };
  }

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const matched = await bcrypt.compare(dto.password, user.password);
    if (!matched) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken, {
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      user: this.toUserDto(user),
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException("Account associated with this token no longer exists");
    }
    if (!user.isActive) {
      throw new UnauthorizedException("Account has been deactivated");
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    const matchedToken = await this.findMatchedToken(storedTokens, refreshToken);
    if (!matchedToken) {
      throw new UnauthorizedException("Refresh token has been revoked or does not exist");
    }

    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: {
        revoked: true,
        lastUsedAt: new Date(),
      },
    });

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return {
      user: this.toUserDto(user),
      tokens,
    };
  }

  async logout(userId: string, refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
    const matched = await this.findMatchedToken(storedTokens, refreshToken);
    if (!matched) {
      return { success: true };
    }
    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revoked: true, lastUsedAt: new Date() },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Account not found or has been deactivated");
    }
    return this.toUserDto(user);
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessExpiresIn =
      (this.configService.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m") as never;
    const refreshExpiresIn =
      (this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "30d") as never;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: refreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }

  private toUserDto(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
    meta?: { deviceId?: string; deviceName?: string; ip?: string; userAgent?: string },
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const ttlDays = 30;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        deviceId: meta?.deviceId,
        deviceName: meta?.deviceName,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      },
    });
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async findMatchedToken(
    tokens: Array<{ tokenHash: string; id: string }>,
    rawToken: string,
  ) {
    for (const token of tokens) {
      const matched = await bcrypt.compare(rawToken, token.tokenHash);
      if (matched) {
        return token;
      }
    }
    return null;
  }
}
