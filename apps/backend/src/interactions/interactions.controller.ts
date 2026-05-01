import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { LikeDishDto } from "./dto/like-dish.dto";
import { SaveRestaurantDto } from "./dto/save-restaurant.dto";
import { InteractionsService } from "./interactions.service";

@Controller("api/v1/interactions")
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post("like")
  likeDish(@CurrentUser() user: { sub: string }, @Body() dto: LikeDishDto) {
    return this.interactionsService.likeDish(user.sub, dto);
  }

  @Post("save")
  saveRestaurant(@CurrentUser() user: { sub: string }, @Body() dto: SaveRestaurantDto) {
    return this.interactionsService.saveRestaurant(user.sub, dto);
  }

  @Get("saved")
  getSaved(@CurrentUser() user: { sub: string }) {
    return this.interactionsService.getSaved(user.sub);
  }

  @Delete("saved/:id")
  async deleteSaved(
    @CurrentUser() user: { sub: string },
    @Param("id", new ParseUUIDPipe({ version: "4", errorHttpStatusCode: 400 })) id: string,
  ) {
    await this.interactionsService.deleteSaved(user.sub, id);
    return { success: true };
  }
}
