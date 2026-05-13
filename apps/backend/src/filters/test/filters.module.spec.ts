import { Test, TestingModule } from "@nestjs/testing";
import { FiltersModule } from "../filters.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";
import { FiltersService } from "../filters.service";
import { FiltersController } from "../filters.controller";
import { UpdateFiltersDto } from "../dto/update-filters.dto";

describe("FiltersModule", () => {
  let controller: FiltersController;
  let service: FiltersService;

  const mockFiltersService = {
    getFilters: jest.fn(),
    updateFilters: jest.fn(),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FiltersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(FiltersService)
      .useValue(mockFiltersService)
      .compile();

    controller = module.get<FiltersController>(FiltersController);
    service = module.get<FiltersService>(FiltersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("getFilters", () => {
    it("should call filtersService.getFilters", async () => {
      const mockUser = { sub: "u1" };
      await controller.getFilters(mockUser);
      expect(service.getFilters).toHaveBeenCalledWith("u1");
    });
  });

  describe("updateFilters", () => {
    it("should call filtersService.updateFilters", async () => {
      const mockUser = { sub: "u1" };
      const dto: UpdateFiltersDto = { minRating: 4 };
      await controller.updateFilters(mockUser, dto);
      expect(service.updateFilters).toHaveBeenCalledWith("u1", dto);
    });
  });
});
