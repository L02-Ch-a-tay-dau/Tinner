import { Test, TestingModule } from "@nestjs/testing";
import { InteractionsModule } from "../interactions.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";

describe("InteractionsModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [InteractionsModule, PrismaModule],
    })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });
});
