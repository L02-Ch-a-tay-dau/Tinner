import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";
import { SuggestionsService } from "./suggestions.service";

@Controller("api/v1/suggestions")
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get()
  getSuggestions(@CurrentUser() user: { sub: string }, @Query() query: GetSuggestionsDto) {
    return this.suggestionsService.getSuggestions(user.sub, query.lat, query.lng, query.dishType);
  }
}
