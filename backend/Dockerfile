FROM node:20-alpine

# Install OpenSSL and other dependencies required by Prisma
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies (including Prisma CLI)
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client (will be regenerated on volume mount, but needed for build)
RUN npx prisma generate || true

# Copy source code
COPY . .

# Build TypeScript (will be regenerated on volume mount in dev mode)
RUN npm run build || true

EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["npm", "start"]

