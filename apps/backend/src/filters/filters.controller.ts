import { Body, Controller, Get, Put } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UpdateFiltersDto } from "./dto/update-filters.dto";
import { FiltersService } from "./filters.service";

@Controller("api/v1/filters")
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get()
  getFilters(@CurrentUser() user: { sub: string }) {
    return this.filtersService.getFilters(user.sub);
  }

  @Put()
  updateFilters(@CurrentUser() user: { sub: string }, @Body() dto: UpdateFiltersDto) {
    return this.filtersService.updateFilters(user.sub, dto);
  }
}
