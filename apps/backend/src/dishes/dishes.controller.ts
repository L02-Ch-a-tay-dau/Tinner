import { Controller, Get } from "@nestjs/common";
import { DishesService } from "./dishes.service";

@Controller("api/v1/dishes")
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  findAll() {
    return this.dishesService.getDishes();
  }
}
