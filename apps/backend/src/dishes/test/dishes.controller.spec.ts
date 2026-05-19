import { Test, TestingModule } from "@nestjs/testing";
import { DishesController } from "../dishes.controller";
import { DishesService } from "../dishes.service";

describe("DishesController", () => {
  let controller: DishesController;
  let service: DishesService;

  const mockDishesService = {
    getDishes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishesController],
      providers: [
        { provide: DishesService, useValue: mockDishesService },
      ],
    }).compile();

    controller = module.get<DishesController>(DishesController);
    service = module.get<DishesService>(DishesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getDishes", () => {
    it("should call dishesService.getDishes", async () => {
      await controller.findAll();
      expect(service.getDishes).toHaveBeenCalled();
    });
  });
});
