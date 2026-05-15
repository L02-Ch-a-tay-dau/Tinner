import { ExecutionContext } from "@nestjs/common";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Public, IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { MatchesField } from "../decorators/matches-field.decorator";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import * as classValidator from "class-validator";

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  registerDecorator: jest.fn(),
}));

describe("Common Decorators", () => {
  describe("Public", () => {
    it("should set isPublic metadata to true", () => {
      class TestController {
        @Public()
        testMethod() {}
      }
      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.testMethod);
      expect(metadata).toBe(true);
    });
  });

  describe("CurrentUser", () => {
    function getParamDecoratorFactory(decorator: Function) {
      class Test {
        test(@decorator() user: any) {}
      }
      const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, "test");
      return args[Object.keys(args)[0]].factory;
    }

    it("should extract user from request", () => {
      const factory = getParamDecoratorFactory(CurrentUser);
      const mockUser = { id: "u1" };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as ExecutionContext;

      const result = factory(null, mockContext);
      expect(result).toBe(mockUser);
    });
  });

  describe("MatchesField", () => {
    it("should register a decorator with correct validator logic", () => {
      const registerSpy = classValidator.registerDecorator as jest.Mock;
      
      class TestDto {
        @MatchesField("password")
        confirmPassword!: string;
      }

      expect(registerSpy).toHaveBeenCalled();
      const options = registerSpy.mock.calls[0][0];
      const validator = options.validator;

      // Test validate logic (Lines 13-16)
      const mockArgs: any = {
        object: { password: "123" },
        constraints: ["password"],
      };
      expect(validator.validate("123", mockArgs)).toBe(true);
      expect(validator.validate("456", mockArgs)).toBe(false);

      // Test defaultMessage logic (Lines 17-20)
      const mockMsgArgs: any = {
        property: "confirmPassword",
        constraints: ["password"],
      };
      expect(validator.defaultMessage(mockMsgArgs)).toBe("confirmPassword must match password");
    });
  });
});
