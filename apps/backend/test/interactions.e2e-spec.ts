import { ExecutionContext, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { InteractionsModule } from "../src/interactions/interactions.module";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { JwtAuthGuard } from "../src/common/guards/jwt-auth.guard";

describe("InteractionsController (e2e)", () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    userInteraction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
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
        InteractionsModule,
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

  describe("/api/v1/interactions/like (POST)", () => {
    it("should record a dish interaction", () => {
      const dto = {
        dishType: "pho",
      };

      mockPrismaService.userInteraction.findFirst.mockResolvedValue(null);
      mockPrismaService.userInteraction.create.mockResolvedValue({
        id: "interaction-1",
        userId: "test-user-id",
        dishType: "PHO",
      });

      return request(app.getHttpServer())
        .post("/api/v1/interactions/like")
        .send(dto)
        .expect(201)
        .expect((res) => {
          // returns { success: true }
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe("/api/v1/interactions/save (POST)", () => {
    it("should toggle a saved restaurant", () => {
      const dto = {
        restaurantId: "550e8400-e29b-41d4-a716-446655440000",
        dishType: "pho",
      };

      // Mock finding an existing restaurant
      mockPrismaService.restaurant.findUnique.mockResolvedValue({ id: dto.restaurantId });
      mockPrismaService.userInteraction.upsert.mockResolvedValue({ id: "save-1" });

      return request(app.getHttpServer())
        .post("/api/v1/interactions/save")
        .send(dto)
        .expect(201) // Post creates or updates
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe("/api/v1/interactions/saved (GET)", () => {
    it("should return a list of saved restaurants", () => {
      const mockSaved = [
        {
          id: "int-1",
          dishType: "pho",
          createdAt: new Date("2026-05-25T08:00:00.000Z"),
          restaurant: { id: "r1", name: "Pho 1", dishTypes: ["pho"] },
        },
      ];
      mockPrismaService.userInteraction.findMany.mockResolvedValue(mockSaved);

      return request(app.getHttpServer())
        .get("/api/v1/interactions/saved")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].restaurant.name).toBe("Pho 1");
        });
    });
  });

  describe("/api/v1/interactions/saved/:id (DELETE)", () => {
    it("should delete a saved interaction", () => {
      const interactionId = "550e8400-e29b-41d4-a716-446655440002";
      mockPrismaService.userInteraction.findFirst.mockResolvedValue({ id: interactionId });
      mockPrismaService.userInteraction.delete.mockResolvedValue({ id: interactionId });

      return request(app.getHttpServer())
        .delete(`/api/v1/interactions/saved/${interactionId}`)
        .expect(200)
        .expect({ success: true });
    });

    it("should return 404 if interaction not found", () => {
      mockPrismaService.userInteraction.findFirst.mockResolvedValue(null);

      return request(app.getHttpServer())
        .delete("/api/v1/interactions/saved/550e8400-e29b-41d4-a716-446655440002")
        .expect(404);
    });
  });
});
