import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { DishesModule } from "./dishes/dishes.module";
import { FiltersModule } from "./filters/filters.module";
import { HealthController } from "./health.controller";
import { InteractionsModule } from "./interactions/interactions.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SuggestionsModule } from "./suggestions/suggestions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "public"),
      serveRoot: "/",
    }),
    PrismaModule,
    AuthModule,
    DishesModule,
    InteractionsModule,
    FiltersModule,
    SuggestionsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
