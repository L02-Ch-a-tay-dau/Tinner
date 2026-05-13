import { Test, TestingModule } from "@nestjs/testing";
import { FiltersService } from "../filters.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("FiltersService", () => {
  let service: FiltersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    userFilter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiltersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FiltersService>(FiltersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("getFilters", () => {
    it("should return existing filters if found", async () => {
      const mockFilters = { userId: "u1", minRating: 4 };
      mockPrismaService.userFilter.findUnique.mockResolvedValue(mockFilters);

      const result = await service.getFilters("u1");
      expect(result).toEqual(mockFilters);
    });

    it("should create and return default filters if not found", async () => {
      mockPrismaService.userFilter.findUnique.mockResolvedValue(null);
      const mockNewFilters = { userId: "u1", minRating: 3 };
      mockPrismaService.userFilter.create.mockResolvedValue(mockNewFilters);

      const result = await service.getFilters("u1");
      expect(prisma.userFilter.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: "u1" })
      }));
      expect(result).toEqual(mockNewFilters);
    });
  });

  describe("updateFilters", () => {
    it("should update filters", async () => {
      mockPrismaService.userFilter.findUnique.mockResolvedValue({ userId: "u1" });
      const dto = { minRating: 4.5 };
      mockPrismaService.userFilter.update.mockResolvedValue({ userId: "u1", ...dto });

      const result = await service.updateFilters("u1", dto as any);
      expect(prisma.userFilter.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: "u1" },
        data: expect.objectContaining({ minRating: 4.5 })
      }));
      expect(result.minRating).toBe(4.5);
    });
  });
});
