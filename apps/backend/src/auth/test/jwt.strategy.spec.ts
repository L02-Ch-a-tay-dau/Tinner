import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "../jwt.strategy";
import { ConfigService } from "@nestjs/config";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === "JWT_ACCESS_SECRET") return "secret";
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return the payload", async () => {
      const payload = { sub: "u1", email: "e@e.com" };
      const result = await strategy.validate(payload);
      expect(result).toEqual(payload);
    });
  });
});
