import { Test, TestingModule } from "@nestjs/testing";
import { DishesModule } from "../dishes.module";
import { PrismaModule } from "../../prisma/prisma.module";

describe("DishesModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DishesModule, PrismaModule],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });
});
