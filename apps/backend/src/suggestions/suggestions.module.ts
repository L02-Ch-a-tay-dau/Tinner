import { Module } from "@nestjs/common";
import { FiltersModule } from "../filters/filters.module";
import { SuggestionsController } from "./suggestions.controller";
import { SuggestionsService } from "./suggestions.service";
import { SerpapiService } from "./serpapi.service";

@Module({
  imports: [FiltersModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, SerpapiService],
})
export class SuggestionsModule {}
