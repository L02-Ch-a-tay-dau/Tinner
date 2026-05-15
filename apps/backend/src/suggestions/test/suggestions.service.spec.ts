import { Test, TestingModule } from "@nestjs/testing";
import { SuggestionsService } from "../suggestions.service";
import { PrismaService } from "../../prisma/prisma.service";
import { FiltersService } from "../../filters/filters.service";
import { FoursquareService } from "../foursquare.service";
import { OverpassService } from "../overpass.service";
import { DishType } from "@prisma/client";

describe("SuggestionsService", () => {
  let service: SuggestionsService;
  let prisma: PrismaService;
  let filtersService: FiltersService;
  let foursquareService: FoursquareService;
  let overpassService: any;

  const mockPrismaService = {
    restaurant: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      createMany: jest.fn(),
    },
  };

  const mockFiltersService = {
    getFilters: jest.fn(),
  };

  const mockFoursquareService = {
    searchByDishType: jest.fn(),
  };

  const mockOverpassService = {
    searchByDishType: jest.fn(),
    fetchAround: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FiltersService, useValue: mockFiltersService },
        { provide: FoursquareService, useValue: mockFoursquareService },
        { provide: OverpassService, useValue: mockOverpassService },
      ],
    }).compile();

    service = module.get<SuggestionsService>(SuggestionsService);
    prisma = module.get<PrismaService>(PrismaService);
    filtersService = module.get<FiltersService>(FiltersService);
    foursquareService = module.get<FoursquareService>(FoursquareService);
    overpassService = module.get<OverpassService>(OverpassService);
    jest.clearAllMocks();
  });

  describe("getSuggestions", () => {
    it("should fetch from overpass, sync to DB, and return suggestions when not fresh", async () => {
      const mockFilters = { maxDistanceKm: 5, minRating: 3 };
      mockFiltersService.getFilters.mockResolvedValue(mockFilters);
      mockPrismaService.restaurant.count.mockResolvedValue(0); // Not fresh

      const mockOverpassResults = [
        {
          id: "p1",
          name: "Place 1",
          address: "Address 1",
          latitude: 10,
          longitude: 10,
          dishTypes: [DishType.pho],
        },
      ];
      mockOverpassService.fetchAround.mockResolvedValue(mockOverpassResults);
      mockPrismaService.restaurant.createMany = jest.fn().mockResolvedValue({ count: 1 });

      const mockSuggestions = [
        { id: "p1", name: "Place 1", latitude: 10, longitude: 10, dishTypes: [DishType.pho], distanceKm: 0 }
      ];
      mockPrismaService.restaurant.findMany.mockResolvedValue(mockSuggestions);

      const result = await service.getSuggestions("u1", 10, 10, DishType.pho);

      expect(filtersService.getFilters).toHaveBeenCalledWith("u1");
      expect(overpassService.fetchAround).toHaveBeenCalledWith(10, 10);
      expect(prisma.restaurant.createMany).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "p1",
        name: "Place 1",
        distanceKm: 0,
      });
    });

    it("should return local suggestions directly if area is fresh (early exit)", async () => {
      mockFiltersService.getFilters.mockResolvedValue({ maxDistanceKm: 5, minRating: 3 });
      mockPrismaService.restaurant.count.mockResolvedValue(20); // Fresh

      const manySuggestions = Array(10).fill(null).map((_, i) => ({
        id: `p${i}`,
        name: `Place ${i}`,
        latitude: 10,
        longitude: 10,
        dishTypes: [DishType.pho],
      }));
      mockPrismaService.restaurant.findMany.mockResolvedValue(manySuggestions);

      const result = await service.getSuggestions("u1", 10, 10, DishType.pho);

      expect(overpassService.fetchAround).not.toHaveBeenCalled();
      expect(result).toHaveLength(10);
    });
  });
});
