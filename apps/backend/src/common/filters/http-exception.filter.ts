import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface ExceptionResponseBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const raw = exception.getResponse();
    const body: ExceptionResponseBody =
      typeof raw === "string" ? { message: raw } : (raw as ExceptionResponseBody);

    const isValidationError = Array.isArray(body.message);
    const message = isValidationError ? "Validation failed" : (body.message ?? exception.message);

    const payload: Record<string, unknown> = {
      statusCode: status,
      error: body.error ?? HttpStatus[status] ?? "Error",
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (isValidationError) {
      payload.details = body.message;
    }

    response.status(status).json(payload);
  }
}
