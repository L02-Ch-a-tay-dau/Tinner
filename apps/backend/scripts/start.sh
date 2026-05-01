#!/bin/sh
set -e

echo "Running prisma migrate deploy..."
pnpm --filter @tinner/backend prisma:migrate:deploy

echo "Starting NestJS backend..."
pnpm --filter @tinner/backend start:prod
