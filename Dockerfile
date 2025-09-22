FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*json tsconfig.json .yarnrc.yml yarn.lock ./
COPY src ./src

RUN corepack enable && \
    yarn --immutable && \
    yarn build

# FROM base AS runner
# WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
# COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
# COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

ENV BUCKET_URL=""
ENV COS_SECRET_ID=""
ENV COS_SECRET_KEY=""
ENV SENTRY_DSN=""

USER hono
EXPOSE 3000

# CMD ["node", "/app/dist/index.js"]
CMD ["sh","-c","yarn run tsx:start"]
