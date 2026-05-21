import { Module } from "@nestjs/common";
import { FiltersModule } from "../filters/filters.module";
import { OverpassService } from "./overpass.service";
import { SuggestionsController } from "./suggestions.controller";
import { SuggestionsService } from "./suggestions.service";

@Module({
  imports: [FiltersModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, OverpassService],
})
export class SuggestionsModule {}
