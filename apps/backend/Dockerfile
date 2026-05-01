FROM node:22-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm@10.33.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json

RUN pnpm install --frozen-lockfile --filter @tinner/backend...

FROM deps AS build
COPY apps/backend ./apps/backend
RUN pnpm --filter @tinner/backend prisma:generate
RUN pnpm --filter @tinner/backend build

FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@10.33.2
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend ./apps/backend
COPY --from=build /app/packages ./packages

RUN chmod +x ./apps/backend/scripts/start.sh

EXPOSE 3000
CMD ["./apps/backend/scripts/start.sh"]
