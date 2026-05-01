import { Module } from "@nestjs/common";
import { FiltersModule } from "../filters/filters.module";
import { FoursquareService } from "./foursquare.service";
import { SuggestionsController } from "./suggestions.controller";
import { SuggestionsService } from "./suggestions.service";

@Module({
  imports: [FiltersModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, FoursquareService],
})
export class SuggestionsModule {}
