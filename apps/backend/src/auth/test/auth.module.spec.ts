import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "../auth.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";

describe("AuthModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });
});
