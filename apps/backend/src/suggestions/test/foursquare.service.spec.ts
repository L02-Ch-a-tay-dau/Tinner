import { Test, TestingModule } from "@nestjs/testing";
import { FoursquareService } from "../foursquare.service";
import { ConfigService } from "@nestjs/config";
import { DishType } from "@prisma/client";
import { Logger } from "@nestjs/common";

describe("FoursquareService", () => {
  let service: FoursquareService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Silence logger during tests
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoursquareService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FoursquareService>(FoursquareService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("searchByDishType", () => {
    it("should return empty array if API key is missing", async () => {
      mockConfigService.get.mockReturnValue(null);
      const result = await service.searchByDishType(DishType.pho, 10, 10, 1000);
      expect(result).toEqual([]);
    });

    it("should return results from fetch", async () => {
      mockConfigService.get.mockReturnValue("fake-key");
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ fsq_place_id: "p1", name: "Place 1" }],
        }),
      });

      const result = await service.searchByDishType(DishType.pho, 10, 10, 1000);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Place 1");
    });

    it("should break loop early if 10 results are collected", async () => {
      mockConfigService.get.mockReturnValue("fake-key");
      const tenResults = Array(10).fill(0).map((_, i) => ({ fsq_place_id: `p${i}`, name: `Place ${i}` }));
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ results: tenResults }),
      });

      const result = await service.searchByDishType(DishType.pho, 10, 10, 1000);
      expect(result).toHaveLength(10);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Should break after first query
    });

    it("should handle fetch error", async () => {
      mockConfigService.get.mockReturnValue("fake-key");
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Error",
      });

      const result = await service.searchByDishType(DishType.pho, 10, 10, 1000);
      expect(result).toEqual([]);
    });

    it("should handle fetch exception", async () => {
      mockConfigService.get.mockReturnValue("fake-key");
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network fail"));

      const result = await service.searchByDishType(DishType.pho, 10, 10, 1000);
      expect(result).toEqual([]);
    });
  });
});
