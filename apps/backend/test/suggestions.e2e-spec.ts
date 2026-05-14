import { ExecutionContext, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { SuggestionsModule } from "../src/suggestions/suggestions.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { JwtAuthGuard } from "../src/common/guards/jwt-auth.guard";
import { OverpassService } from "../src/suggestions/overpass.service";
import { DishType } from "@prisma/client";

describe("SuggestionsController (e2e)", () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    userFilter: {
      findUnique: jest.fn(),
    },
    restaurant: {
      count: jest.fn(),
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockOverpassService = {
    fetchAround: jest.fn(),
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
        SuggestionsModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(OverpassService)
      .useValue(mockOverpassService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
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

  describe("/api/v1/suggestions (GET)", () => {
    it("should return suggestions based on filters and location", () => {
      // Mock user filters
      mockPrismaService.userFilter.findUnique.mockResolvedValue({
        maxDistanceKm: 5,
        minRating: 3,
      });

      // Mock fresh area
      mockPrismaService.restaurant.count.mockResolvedValue(25);

      // Mock DB local restaurants
      mockPrismaService.restaurant.findMany.mockResolvedValue([
        {
          id: "r1",
          name: "Local Pho",
          latitude: 10.001,
          longitude: 10.001,
          dishTypes: [DishType.pho],
        },
      ]);

      return request(app.getHttpServer())
        .get("/api/v1/suggestions")
        .query({ lat: 10, lng: 10, dishType: DishType.pho })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0].name).toBe("Local Pho");
            expect(res.body[0].distanceKm).toBeDefined();
          }
        });
    });

    it("should fail validation if lat or lng are missing", () => {
      return request(app.getHttpServer())
        .get("/api/v1/suggestions")
        // Missing lat, lng
        .expect(400);
    });

    it("should return empty array if no restaurants found around", () => {
      mockPrismaService.userFilter.findUnique.mockResolvedValue({ maxDistanceKm: 5, minRating: 3 });
      mockPrismaService.restaurant.count.mockResolvedValue(0); // Not fresh
      mockOverpassService.fetchAround.mockResolvedValue([]); // No results from map
      mockPrismaService.restaurant.findMany.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get("/api/v1/suggestions")
        .query({ lat: 10, lng: 10 })
        .expect(200)
        .expect([]);
    });
  });
});
