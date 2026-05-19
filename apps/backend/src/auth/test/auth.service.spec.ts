import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userFilter: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue("mock-token"),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "JWT_ACCESS_EXPIRES_IN") return "15m";
      if (key === "JWT_REFRESH_EXPIRES_IN") return "30d";
      return null;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === "JWT_ACCESS_SECRET") return "access-secret";
      if (key === "JWT_REFRESH_SECRET") return "refresh-secret";
      throw new Error(`Config key ${key} not found`);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDto = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      fullName: "Test User",
      phone: "1234567890",
    };

    it("should throw ConflictException if email is already registered", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: "1" });
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if username is already taken", async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: "1" }); // username check
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it("should successfully register a new user", async () => {
      const mockUser = { id: "user-1", ...registerDto, password: "hashedPassword" };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);
      expect(result.user.email).toBe(registerDto.email);
    });
  });

  describe("login", () => {
    const loginDto = { email: "test@example.com", password: "password123" };

    it("should throw UnauthorizedException if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto, {})).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password does not match", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ password: "hashedPassword" });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto, {})).rejects.toThrow(UnauthorizedException);
    });

    it("should return user and tokens on successful login", async () => {
      const mockUser = { id: "user-1", email: "test@example.com", password: "hashedPassword" };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto, {});
      expect(result).toHaveProperty("tokens");
    });
  });

  describe("refresh", () => {
    const refreshToken = "valid-token";

    it("should throw UnauthorizedException if token is invalid", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error());
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user does not exist", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user is inactive", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "user-1", isActive: false });
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if token not found in DB", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "user-1", isActive: true });
      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it("should successfully refresh tokens", async () => {
      const mockUser = { id: "user-1", isActive: true };
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.findMany.mockResolvedValue([{ id: "t1", tokenHash: "hash" }]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.refresh(refreshToken);
      expect(result).toHaveProperty("tokens");
      expect(prisma.refreshToken.update).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should revoke token if found", async () => {
      mockPrismaService.refreshToken.findMany.mockResolvedValue([{ id: "t1", tokenHash: "hash" }]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.logout("token");
      expect(result.success).toBe(true);
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ revoked: true }) }));
    });

    it("should return success if token not found", async () => {
      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);
      const result = await service.logout("token");
      expect(result.success).toBe(true);
    });
  });

  describe("me", () => {
    it("should return user info", async () => {
      const mockUser = { id: "u1", email: "e", username: "u", isActive: true };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.me("u1");
      expect(result.id).toBe("u1");
    });

    it("should throw if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.me("u1")).rejects.toThrow(UnauthorizedException);
    });
  });
});
