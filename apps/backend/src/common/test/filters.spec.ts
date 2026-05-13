import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { HttpExceptionFilter } from "../filters/http-exception.filter";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockRequest = {
    url: "/test",
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnValue(mockResponse),
    getRequest: jest.fn().mockReturnValue(mockRequest),
  } as unknown as ArgumentsHost;

  it("should catch HttpException and return formatted response", () => {
    const status = HttpStatus.BAD_REQUEST;
    const exception = new HttpException("Bad Request", status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: status,
        path: mockRequest.url,
        message: "Bad Request",
      }),
    );
  });

  it("should handle validation error array correctly", () => {
    const status = HttpStatus.BAD_REQUEST;
    const responseBody = { message: ["email is invalid"], error: "Bad Request" };
    const exception = new HttpException(responseBody, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation failed",
        details: responseBody.message,
      }),
    );
  });
});
