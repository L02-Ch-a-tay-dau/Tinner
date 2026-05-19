import { Test, TestingModule } from "@nestjs/testing";
import { OverpassService } from "../overpass.service";
import { DishType } from "@prisma/client";

describe("OverpassService", () => {
  let service: OverpassService;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [OverpassService],
    }).compile();

    service = module.get<OverpassService>(OverpassService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("fetchAround", () => {
    it("should return empty array if lat or lng is not finite", async () => {
      expect(await service.fetchAround(NaN, 10)).toEqual([]);
      expect(await service.fetchAround(10, Infinity)).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should return empty array and log error if fetch throws", async () => {
      fetchMock.mockRejectedValue(new Error("Network Error"));
      const result = await service.fetchAround(10, 10);
      expect(result).toEqual([]);
      expect(fetchMock).toHaveBeenCalled();
    });

    it("should return empty array and log error if response is not ok", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue("Internal Server Error"),
      });
      const result = await service.fetchAround(10, 10);
      expect(result).toEqual([]);
    });

    it("should map elements properly on success", async () => {
      const mockElements = [
        {
          type: "node",
          id: 1,
          lat: 10,
          lon: 10,
          tags: {
            name: "Pho Restaurant",
            amenity: "restaurant",
            cuisine: "vietnamese",
            "addr:housenumber": "123",
            "addr:street": "Main St",
            "addr:city": "HCMC",
          },
        },
        {
          type: "way",
          id: 2,
          center: { lat: 20, lon: 20 },
          tags: {
            name: "Pho Cafe",
            "addr:full": "Full Address string",
          },
        },
        {
          // Missing name, should be skipped
          type: "node",
          id: 3,
          lat: 30,
          lon: 30,
          tags: { amenity: "fast_food" },
        },
        {
          // Missing coords, should be skipped
          type: "relation",
          id: 4,
          tags: { name: "No coords place" },
        },
        {
          // Duplicate placeId "n1" (type: node, id: 1), should be skipped
          type: "node",
          id: 1,
          lat: 15,
          lon: 15,
          tags: { name: "Duplicate" },
        },
      ];

      fetchMock.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ elements: mockElements }),
      });

      const result = await service.fetchAround(10, 10);

      expect(result).toHaveLength(2);
      
      expect(result[0]).toEqual({
        id: "n1",
        name: "Pho Restaurant",
        latitude: 10,
        longitude: 10,
        address: "123, Main St, HCMC",
        amenity: "restaurant",
        cuisine: "vietnamese",
        dishTypes: ["pho"],
      });

      expect(result[1]).toEqual({
        id: "w2",
        name: "Pho Cafe",
        latitude: 20,
        longitude: 20,
        address: "Full Address string",
        amenity: null,
        cuisine: null,
        dishTypes: ["pho"],
      });
    });

    it("should handle empty elements safely", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}), // elements is missing
      });

      const result = await service.fetchAround(10, 10);
      expect(result).toEqual([]);
    });
  });
});
