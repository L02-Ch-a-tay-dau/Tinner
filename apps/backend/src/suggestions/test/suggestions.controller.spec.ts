import { Test, TestingModule } from "@nestjs/testing";
import { SuggestionsController } from "../suggestions.controller";
import { SuggestionsService } from "../suggestions.service";
import { DishType } from "@prisma/client";

describe("SuggestionsController", () => {
  let controller: SuggestionsController;
  let service: SuggestionsService;

  const mockSuggestionsService = {
    getSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuggestionsController],
      providers: [
        { provide: SuggestionsService, useValue: mockSuggestionsService },
      ],
    }).compile();

    controller = module.get<SuggestionsController>(SuggestionsController);
    service = module.get<SuggestionsService>(SuggestionsService);
  });

  describe("getSuggestions", () => {
    it("should call service.getSuggestions", async () => {
      const dto = { dishType: DishType.pho, lat: 10, lng: 10 };
      await controller.getSuggestions({ sub: "u1" }, dto);
      expect(service.getSuggestions).toHaveBeenCalledWith("u1", dto.lat, dto.lng, dto.dishType);
    });
  });
});
