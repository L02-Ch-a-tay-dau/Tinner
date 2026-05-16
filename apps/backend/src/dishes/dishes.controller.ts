import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { DishesService } from "./dishes.service";

@Controller("api/v1/dishes")
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Public()
  @Get()
  findAll() {
    return this.dishesService.getDishes();
  }
}
