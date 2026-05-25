import { Test, TestingModule } from "@nestjs/testing";
import { SuggestionsService } from "../suggestions.service";
import { PrismaService } from "../../prisma/prisma.service";
import { FiltersService } from "../../filters/filters.service";
import { SerpapiService } from "../serpapi.service";
import { DishType } from "@prisma/client";

describe("SuggestionsService", () => {
  let service: SuggestionsService;
  let prisma: PrismaService;
  let filtersService: FiltersService;
  let serpapiService: SerpapiService;

  const mockPrismaService = {
    restaurant: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockFiltersService = {
    getFilters: jest.fn(),
  };

  const mockSerpapiService = {
    searchNearby: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FiltersService, useValue: mockFiltersService },
        { provide: SerpapiService, useValue: mockSerpapiService },
      ],
    }).compile();

    service = module.get<SuggestionsService>(SuggestionsService);
    prisma = module.get<PrismaService>(PrismaService);
    filtersService = module.get<FiltersService>(FiltersService);
    serpapiService = module.get<SerpapiService>(SerpapiService);
    jest.clearAllMocks();
  });

  describe("getSuggestions", () => {
    it("should fetch from SerpAPI, sync to DB, and return suggestions", async () => {
      const mockFilters = { maxDistanceKm: 5, minRating: 3 };
      mockFiltersService.getFilters.mockResolvedValue(mockFilters);

      const mockSerpapiResults = [
        {
          id: "p1",
          name: "Place 1",
          address: "Address 1",
          latitude: 10,
          longitude: 10,
          dishTypes: [DishType.pho],
          cuisine: "vietnamese",
          priceLevel: null,
          imageUrl: null,
        },
      ];
      mockSerpapiService.searchNearby.mockResolvedValue(mockSerpapiResults);
      mockPrismaService.restaurant.createMany = jest.fn().mockResolvedValue({ count: 1 });

      const mockSuggestions = [
        {
          id: "p1",
          name: "Place 1",
          address: "Address 1",
          city: null,
          latitude: 10,
          longitude: 10,
          rating: null,
          placeUrl: null,
          imageUrl: null,
          dishTypes: [DishType.pho],
          hours: null,
          priceLevel: null,
          cuisineTag: "vietnamese",
        }
      ];
      mockPrismaService.restaurant.findMany.mockResolvedValue(mockSuggestions);

      const result = await service.getSuggestions("u1", 10, 10, DishType.pho);

      expect(filtersService.getFilters).toHaveBeenCalledWith("u1");
      expect(serpapiService.searchNearby).toHaveBeenCalledWith(10, 10, 5000);
      expect(prisma.restaurant.createMany).toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        id: "p1",
        name: "Place 1",
        distanceKm: 0,
        dishTypes: ["pho"],
      });
    });

    it("should still return local suggestions when SerpAPI has no results", async () => {
      mockFiltersService.getFilters.mockResolvedValue({ maxDistanceKm: 5, minRating: 3 });
      mockSerpapiService.searchNearby.mockResolvedValue([]);

      const manySuggestions = Array(10).fill(null).map((_, i) => ({
        id: `p${i}`,
        name: `Place ${i}`,
        address: null,
        city: null,
        latitude: 10,
        longitude: 10,
        rating: null,
        placeUrl: null,
        imageUrl: null,
        dishTypes: [DishType.pho],
        hours: null,
        priceLevel: null,
        cuisineTag: "vietnamese",
      }));
      mockPrismaService.restaurant.findMany.mockResolvedValue(manySuggestions);

      const result = await service.getSuggestions("u1", 10, 10, DishType.pho);

      expect(serpapiService.searchNearby).toHaveBeenCalled();
      expect(result).toHaveLength(10);
    });
  });
});
