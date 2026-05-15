import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

describe("AuthController (e2e)", () => {
  let app: INestApplication<App>;

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
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/api/v1/auth/register (POST)", () => {
    const registerDto = {
      email: "e2e@example.com",
      username: "e2euser",
      password: "Password123",
      confirmPassword: "Password123",
      fullName: "E2E User",
      phone: "+84123456789",
    };

    it("should register a new user", () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: "e2e-user-id",
        ...registerDto,
        role: "USER",
      });

      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.user.email).toBe(registerDto.email);
          expect(res.body.tokens).toBeDefined();
        });
    });

    it("should return 409 if email is already taken", () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "existing" });

      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(registerDto)
        .expect(409);
    });
  });

  describe("/api/v1/auth/login (POST)", () => {
    const loginDto = {
      email: "e2e@example.com",
      password: "password123",
    };

    it("should login an existing user", () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "e2e-user-id",
        email: loginDto.email,
        password: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send(loginDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.tokens).toBeDefined();
        });
    });

    it("should return 401 for invalid credentials (wrong password)", () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "e2e-user-id",
        email: loginDto.email,
        password: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send(loginDto)
        .expect(401);
    });

    it("should return 401 for non-existent user", () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send(loginDto)
        .expect(401);
    });
  });
});
