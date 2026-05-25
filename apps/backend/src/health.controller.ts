import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("health")
@Controller("api/v1/health")
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Health check", description: "Returns service status. No authentication required." })
  getHealth() {
    return { status: "ok" };
  }
}
