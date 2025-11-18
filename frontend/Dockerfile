FROM node:20-alpine

WORKDIR /app

# Build argument for API URL (opcional)
ARG VITE_SERVICE_URL_BACKEND
ARG VITE_API_URL

# Set environment variables for build time
ENV VITE_SERVICE_URL_BACKEND=${VITE_SERVICE_URL_BACKEND}
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

EXPOSE 5173

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

