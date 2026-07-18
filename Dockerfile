# Full-app container for local "one command" runs (docker compose up --build).
# Note: hosted deploys use Vercel, which builds from source and does NOT use this image.
FROM node:22-bookworm-slim

WORKDIR /app

# pnpm via corepack
RUN corepack enable

# Prisma needs OpenSSL at build + runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching.
# Copy the Prisma schema before install so the `postinstall` prisma generate works.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# App source + production build
COPY . .
RUN pnpm build

EXPOSE 3000

# Apply migrations, seed demo data, then serve. Safe to re-run (seed resets first).
# next start defaults to 0.0.0.0:3000. Apply migrations + seed, then serve.
CMD ["sh", "-c", "pnpm db:deploy && pnpm db:seed && pnpm exec next start -H 0.0.0.0 -p 3000"]
