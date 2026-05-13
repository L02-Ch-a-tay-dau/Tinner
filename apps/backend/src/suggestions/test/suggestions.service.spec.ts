import { Test, TestingModule } from "@nestjs/testing";
import { SuggestionsService } from "../suggestions.service";
import { PrismaService } from "../../prisma/prisma.service";
import { FiltersService } from "../../filters/filters.service";
import { FoursquareService } from "../foursquare.service";
import { DishType } from "@prisma/client";

describe("SuggestionsService", () => {
  let service: SuggestionsService;
  let prisma: PrismaService;
  let filtersService: FiltersService;
  let foursquareService: FoursquareService;

  const mockPrismaService = {
    restaurant: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockFiltersService = {
    getFilters: jest.fn(),
  };

  const mockFoursquareService = {
    searchByDishType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FiltersService, useValue: mockFiltersService },
        { provide: FoursquareService, useValue: mockFoursquareService },
      ],
    }).compile();

    service = module.get<SuggestionsService>(SuggestionsService);
    prisma = module.get<PrismaService>(PrismaService);
    filtersService = module.get<FiltersService>(FiltersService);
    foursquareService = module.get<FoursquareService>(FoursquareService);
    jest.clearAllMocks();
  });

  describe("getSuggestions", () => {
    it("should fetch from foursquare, sync to DB, and return suggestions", async () => {
      const mockFilters = { maxDistanceKm: 5, minRating: 3, priceRanges: ["$", "$$"] };
      mockFiltersService.getFilters.mockResolvedValue(mockFilters);

      const mockFsqResults = [
        {
          fsq_place_id: "p1",
          name: "Place 1",
          location: { formatted_address: "Address 1" },
          latitude: 10,
          longitude: 10,
          rating: 8,
          price: 2,
        },
      ];
      mockFoursquareService.searchByDishType.mockResolvedValue(mockFsqResults);

      const mockSuggestions = [
        { id: "p1", name: "Place 1", latitude: 10, longitude: 10, dishTypes: [DishType.pho] }
      ];
      mockPrismaService.restaurant.findMany.mockResolvedValue(mockSuggestions);

      const result = await service.getSuggestions("u1", DishType.pho, 10, 10);

      expect(filtersService.getFilters).toHaveBeenCalledWith("u1");
      expect(foursquareService.searchByDishType).toHaveBeenCalledWith(DishType.pho, 10, 10, 5000);
      expect(result[0]).toMatchObject({
        id: "p1",
        name: "Place 1",
        distanceKm: 0,
      });
    });

    it("should return local suggestions directly if enough are found (early exit)", async () => {
      mockFiltersService.getFilters.mockResolvedValue({ maxDistanceKm: 5, minRating: 3 });
      
      const manySuggestions = Array(10).fill(null).map((_, i) => ({
        id: `p${i}`,
        name: `Place ${i}`,
        latitude: 10,
        longitude: 10,
        dishTypes: [DishType.pho],
      }));
      mockPrismaService.restaurant.findMany.mockResolvedValue(manySuggestions);

      const result = await service.getSuggestions("u1", DishType.pho, 10, 10);

      expect(foursquareService.searchByDishType).not.toHaveBeenCalled();
      expect(result).toHaveLength(10);
    });

    it("should skip Foursquare results with missing critical fields", async () => {
      mockFiltersService.getFilters.mockResolvedValue({ maxDistanceKm: 5, minRating: 3 });
      mockPrismaService.restaurant.findMany.mockResolvedValue([]); // No local results
      
      const invalidResults = [
        { name: "Missing ID" }, // No fsq_place_id
        { fsq_place_id: "p1", name: "Missing Lat", longitude: 10 }, // No latitude
      ];
      mockFoursquareService.searchByDishType.mockResolvedValue(invalidResults);

      const result = await service.getSuggestions("u1", DishType.pho, 10, 10);
      
      expect(prisma.restaurant.upsert).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});
