import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { dump } from "js-yaml";
import { AppModule } from "../src/app.module";
import { createSwaggerDocument } from "../src/swagger-document";
import { JwtStrategy } from "../src/auth/jwt.strategy";
import { PrismaService } from "../src/prisma/prisma.service";
import { SerpapiService } from "../src/suggestions/serpapi.service";

config({ path: join(__dirname, "../.env") });

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/tinner?schema=public";
process.env.JWT_ACCESS_SECRET ??= "openapi-generate-dummy-access-secret";
process.env.JWT_REFRESH_SECRET ??= "openapi-generate-dummy-refresh-secret";
process.env.SERPAPI_API_KEY ??= "openapi-generate-dummy-serpapi-key";

const OUTPUT = join(__dirname, "../../../docs/openapi.yaml");

const mockPrisma = {
  onModuleInit: async () => {},
  $connect: async () => {},
  $disconnect: async () => {},
};

const mockSerpapi = {
  searchNearby: async () => [],
};

async function generate() {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            DATABASE_URL: process.env.DATABASE_URL,
            JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
            SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
          }),
        ],
      }),
      AppModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .overrideProvider(JwtStrategy)
    .useValue({ validate: (payload: unknown) => payload })
    .overrideProvider(SerpapiService)
    .useValue(mockSerpapi)
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const document = createSwaggerDocument(app);
  const yaml = dump(document, { noRefs: false, lineWidth: 120 });

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, yaml, "utf8");

  await app.close();
  console.log(`Wrote OpenAPI spec to ${OUTPUT}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
