import { type INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle("Tinner API")
    .setDescription(
      "REST API for Tinner — auth, dish suggestions, filters, and saved restaurants. " +
        "Most routes require JWT Bearer token unless marked public.",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token from POST /api/v1/auth/login or /register",
      },
      "access-token",
    )
    .addServer("http://localhost:3000", "Local development")
    .build();
}

export function createSwaggerDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, buildSwaggerConfig());
}

export function setupSwaggerUi(app: INestApplication) {
  const document = createSwaggerDocument(app);
  SwaggerModule.setup("api/docs", app, document);
}
