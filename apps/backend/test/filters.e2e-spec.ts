import { ExecutionContext, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { FiltersModule } from "../src/filters/filters.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { JwtAuthGuard } from "../src/common/guards/jwt-auth.guard";

describe("FiltersController (e2e)", () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    userFilter: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { sub: "test-user-id" };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        FiltersModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalGuards({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { sub: "test-user-id" };
        return true;
      },
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/api/v1/filters (GET)", () => {
    it("should return user filters", () => {
      const mockFilters = {
        userId: "test-user-id",
        minRating: 4,
        maxDistanceKm: 5,
        priceRanges: ["$"],
        cuisines: ["vietnamese"],
        dietary: [],
      };
      mockPrismaService.userFilter.findUnique.mockResolvedValue(mockFilters);

      return request(app.getHttpServer())
        .get("/api/v1/filters")
        .expect(200)
        .expect((res) => {
          expect(res.body.minRating).toBe(4);
          expect(res.body.cuisines).toEqual(["vietnamese"]);
        });
    });

    it("should handle the case where user has no filters records yet", () => {
      mockPrismaService.userFilter.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get("/api/v1/filters")
        .expect(200); // Should return some default or 200 with service logic
    });
  });

  describe("/api/v1/filters (PUT)", () => {
    it("should update user filters", () => {
      const updateDto = {
        minRating: 3,
        maxDistanceKm: 7,
      };

      const updatedFilters = {
        userId: "test-user-id",
        ...updateDto,
        priceRanges: ["$"],
        cuisines: [],
        dietary: [],
      };
      
      mockPrismaService.userFilter.update.mockResolvedValue(updatedFilters);

      return request(app.getHttpServer())
        .put("/api/v1/filters")
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.minRating).toBe(3);
          expect(res.body.maxDistanceKm).toBe(7);
        });
    });

    it("should return 400 on validation error", () => {
      const invalidDto = {
        minRating: 10, // Invalid rating
      };

      return request(app.getHttpServer())
        .put("/api/v1/filters")
        .send(invalidDto)
        .expect(400);
    });
  });
});
