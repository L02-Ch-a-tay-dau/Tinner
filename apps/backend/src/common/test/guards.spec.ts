import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it("should return true if route is public", () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it("should call super.canActivate if route is not public", () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const superSpy = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), "canActivate").mockReturnValue(true);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(superSpy).toHaveBeenCalled();
  });
});
