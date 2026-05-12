import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool, type PoolConfig } from "pg";

function buildPoolConfig(rawUrl: string | undefined): PoolConfig {
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(rawUrl);
  const sslMode = url.searchParams.get("sslmode");
  const requiresSsl =
    sslMode != null && /^(require|verify-ca|verify-full|prefer)$/i.test(sslMode);

  url.searchParams.delete("sslmode");
  url.searchParams.delete("ssl");

  return {
    connectionString: url.toString(),
    ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool(buildPoolConfig(process.env.DATABASE_URL));
    const adapter = new PrismaPg(pool);
    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
