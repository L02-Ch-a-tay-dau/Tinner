import { Test, TestingModule } from "@nestjs/testing";
import { FiltersController } from "../filters.controller";
import { FiltersService } from "../filters.service";

describe("FiltersController", () => {
  let controller: FiltersController;
  let service: FiltersService;

  const mockFiltersService = {
    getFilters: jest.fn(),
    updateFilters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiltersController],
      providers: [
        { provide: FiltersService, useValue: mockFiltersService },
      ],
    }).compile();

    controller = module.get<FiltersController>(FiltersController);
    service = module.get<FiltersService>(FiltersService);
  });

  describe("getFilters", () => {
    it("should call filtersService.getFilters", async () => {
      await controller.getFilters({ sub: "u1" });
      expect(service.getFilters).toHaveBeenCalledWith("u1");
    });
  });

  describe("updateFilters", () => {
    it("should call filtersService.updateFilters", async () => {
      const dto: any = { minRating: 4 };
      await controller.updateFilters({ sub: "u1" }, dto);
      expect(service.updateFilters).toHaveBeenCalledWith("u1", dto);
    });
  });
});
