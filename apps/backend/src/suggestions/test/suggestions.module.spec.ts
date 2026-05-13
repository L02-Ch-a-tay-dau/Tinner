import { Test, TestingModule } from "@nestjs/testing";
import { SuggestionsModule } from "../suggestions.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { FiltersModule } from "../../filters/filters.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { FiltersService } from "../../filters/filters.service";

describe("SuggestionsModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        SuggestionsModule, 
        PrismaModule, 
        FiltersModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    })
    .overrideProvider(PrismaService).useValue({})
    .overrideProvider(FiltersService).useValue({})
    .compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });
});
