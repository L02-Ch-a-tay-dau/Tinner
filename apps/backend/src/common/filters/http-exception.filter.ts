import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface ExceptionResponseBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDev = process.env.NODE_ENV !== "production";

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Internal Server Error";
    let validationDetails: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const raw = exception.getResponse();
      const body: ExceptionResponseBody = typeof raw === "string" ? { message: raw } : raw;

      error = body.error ?? HttpStatus[status] ?? "Error";
      if (Array.isArray(body.message)) {
        message = "Validation failed";
        validationDetails = body.message;
      } else {
        message = body.message ?? exception.message;
      }
    } else {
      this.logger.error(
        `Unhandled exception at ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const payload: Record<string, unknown> = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (this.isDev && validationDetails) {
      payload.details = validationDetails;
    }

    response.status(status).json(payload);
  }
}
