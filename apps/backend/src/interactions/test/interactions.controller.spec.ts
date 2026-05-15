import { Test, TestingModule } from "@nestjs/testing";
import { InteractionsController } from "../interactions.controller";
import { InteractionsService } from "../interactions.service";

describe("InteractionsController", () => {
  let controller: InteractionsController;
  let service: InteractionsService;

  const mockInteractionsService = {
    likeDish: jest.fn(),
    saveRestaurant: jest.fn(),
    getSaved: jest.fn(),
    deleteSaved: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionsController],
      providers: [
        { provide: InteractionsService, useValue: mockInteractionsService },
      ],
    }).compile();

    controller = module.get<InteractionsController>(InteractionsController);
    service = module.get<InteractionsService>(InteractionsService);
  });

  describe("likeDish", () => {
    it("should call service.likeDish", async () => {
      const dto: any = { dishType: "pho" };
      await controller.likeDish({ sub: "u1" }, dto);
      expect(service.likeDish).toHaveBeenCalledWith("u1", dto);
    });
  });

  describe("saveRestaurant", () => {
    it("should call service.saveRestaurant", async () => {
      const dto: any = { restaurantId: "r1" };
      await controller.saveRestaurant({ sub: "u1" }, dto);
      expect(service.saveRestaurant).toHaveBeenCalledWith("u1", dto);
    });
  });

  describe("getSaved", () => {
    it("should call service.getSaved", async () => {
      await controller.getSaved({ sub: "u1" });
      expect(service.getSaved).toHaveBeenCalledWith("u1");
    });
  });

  describe("deleteSaved", () => {
    it("should call service.deleteSaved", async () => {
      await controller.deleteSaved({ sub: "u1" }, "i1");
      expect(service.deleteSaved).toHaveBeenCalledWith("u1", "i1");
    });
  });
});
