import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DishesService } from "./dishes.service";

@ApiTags("dishes")
@ApiBearerAuth("access-token")
@Controller("api/v1/dishes")
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  @ApiOperation({ summary: "List dishes", description: "Return all Vietnamese dish types supported by suggestions." })
  findAll() {
    return this.dishesService.getDishes();
  }
}
