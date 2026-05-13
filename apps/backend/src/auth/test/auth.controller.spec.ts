import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call authService.register", async () => {
      const dto: any = { email: "test@test.com" };
      await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe("login", () => {
    it("should call authService.login", async () => {
      const dto: any = { email: "test@test.com" };
      const req: any = { headers: { "user-agent": "test-agent" } };
      await controller.login(dto, "1.2.3.4", req);
      expect(service.login).toHaveBeenCalledWith(dto, { ip: "1.2.3.4", userAgent: "test-agent" });
    });
  });

  describe("refresh", () => {
    it("should call authService.refresh", async () => {
      await controller.refresh({ refreshToken: "rt" });
      expect(service.refresh).toHaveBeenCalledWith("rt");
    });
  });

  describe("logout", () => {
    it("should call authService.logout", async () => {
      await controller.logout({ refreshToken: "rt" });
      expect(service.logout).toHaveBeenCalledWith("rt");
    });
  });

  describe("me", () => {
    it("should call authService.me", async () => {
      await controller.me({ sub: "u1" });
      expect(service.me).toHaveBeenCalledWith("u1");
    });
  });
});
