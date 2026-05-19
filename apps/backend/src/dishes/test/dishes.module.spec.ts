import { Test, TestingModule } from "@nestjs/testing";
import { DishesModule } from "../dishes.module";
import { PrismaModule } from "../../prisma/prisma.module";

describe("DishesModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/test_db";
    module = await Test.createTestingModule({
      imports: [DishesModule, PrismaModule],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });
});
