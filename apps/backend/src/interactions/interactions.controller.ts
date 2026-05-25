import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { LikeDishDto } from "./dto/like-dish.dto";
import { SaveRestaurantDto } from "./dto/save-restaurant.dto";
import { InteractionsService } from "./interactions.service";

@ApiTags("interactions")
@ApiBearerAuth("access-token")
@Controller("api/v1/interactions")
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post("like")
  @ApiOperation({ summary: "Like a dish", description: "Record a positive swipe interaction for a dish type." })
  likeDish(@CurrentUser() user: { sub: string }, @Body() dto: LikeDishDto) {
    return this.interactionsService.likeDish(user.sub, dto);
  }

  @Post("save")
  @ApiOperation({ summary: "Save restaurant", description: "Add a restaurant to the user's saved collection." })
  saveRestaurant(@CurrentUser() user: { sub: string }, @Body() dto: SaveRestaurantDto) {
    return this.interactionsService.saveRestaurant(user.sub, dto);
  }

  @Get("saved")
  @ApiOperation({ summary: "List saved restaurants", description: "Return all restaurants saved by the user." })
  getSaved(@CurrentUser() user: { sub: string }) {
    return this.interactionsService.getSaved(user.sub);
  }

  @Delete("saved/:id")
  @ApiOperation({ summary: "Remove saved restaurant", description: "Delete one saved restaurant by interaction id." })
  @ApiParam({ name: "id", description: "Saved interaction UUID", format: "uuid" })
  async deleteSaved(
    @CurrentUser() user: { sub: string },
    @Param("id", new ParseUUIDPipe({ version: "4", errorHttpStatusCode: 400 })) id: string,
  ) {
    await this.interactionsService.deleteSaved(user.sub, id);
    return { success: true };
  }
}
