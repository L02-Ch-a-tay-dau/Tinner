import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("health")
@Controller()
export class HealthController {
  @Public()
  @Get("api/v1/health")
  @ApiOperation({ summary: "Health check", description: "Returns service status. No authentication required." })
  getHealth() {
    return { status: "ok" };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Root endpoint", description: "Returns welcome message." })
  getRoot() {
    return { message: "Welcome to Tinner Backend API. Visit /api/docs for Swagger documentation." };
  }
}
