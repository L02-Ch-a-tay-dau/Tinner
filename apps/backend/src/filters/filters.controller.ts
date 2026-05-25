import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UpdateFiltersDto } from "./dto/update-filters.dto";
import { FiltersService } from "./filters.service";

@ApiTags("filters")
@ApiBearerAuth("access-token")
@Controller("api/v1/filters")
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get()
  @ApiOperation({ summary: "Get user filters", description: "Return cuisine, distance, price, and rating preferences." })
  getFilters(@CurrentUser() user: { sub: string }) {
    return this.filtersService.getFilters(user.sub);
  }

  @Put()
  @ApiOperation({ summary: "Update user filters", description: "Persist filter preferences used by suggestions." })
  updateFilters(@CurrentUser() user: { sub: string }, @Body() dto: UpdateFiltersDto) {
    return this.filtersService.updateFilters(user.sub, dto);
  }
}
