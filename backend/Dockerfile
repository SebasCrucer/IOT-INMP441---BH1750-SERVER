FROM node:20-alpine

# Install OpenSSL and other dependencies required by Prisma
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

