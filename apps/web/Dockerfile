FROM node:18-alpine AS base

# Get NPM packages
FROM base AS dependencies
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install turbo -g
COPY . .
RUN turbo prune --scope="@language-tutor/server" --docker

# Build the source code only when needed
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=dependencies /app/out/json/ .
COPY --from=dependencies /app/out/package-lock.json ./package-lock.json
RUN npm install
RUN npm install turbo -g

#ARG SENTRY_AUTH_TOKEN
COPY --from=dependencies /app/out/full/ .
RUN turbo run build --scope="@language-tutor/server"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs  /app .
#COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

WORKDIR /app/apps/server
ARG ENVIRONMENT=staging 

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

USER nextjs
CMD ["node", "lib/main.js"]