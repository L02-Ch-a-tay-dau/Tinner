import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";
import { SuggestionsService } from "./suggestions.service";

@ApiTags("suggestions")
@ApiBearerAuth("access-token")
@Controller("api/v1/suggestions")
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get()
  @ApiOperation({
    summary: "Nearby restaurant suggestions",
    description:
      "Fetch restaurants near lat/lng, optionally filtered by dish type and user preferences. May ingest from SerpAPI.",
  })
  getSuggestions(@CurrentUser() user: { sub: string }, @Query() query: GetSuggestionsDto) {
    return this.suggestionsService.getSuggestions(user.sub, query.lat, query.lng, query.dishType);
  }
}
