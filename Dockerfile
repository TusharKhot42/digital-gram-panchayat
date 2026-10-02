# Multi-stage / clean production Dockerfile for Digital Gram Panchayat Backend API
FROM node:20-alpine AS runner

WORKDIR /app

# Ensure security with non-root user
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies needed for native builds or healthcheck curl
RUN apk add --no-cache curl

# Copy dependency definitions
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/shared/package.json ./frontend/shared/

# Install production dependencies for backend and shared workspace
RUN npm ci --omit=dev --workspace=@dgp/backend --workspace=@dgp/shared

# Copy application source
COPY backend ./backend
COPY frontend/shared ./frontend/shared

# Create upload directory for fallback storage and set permissions
RUN mkdir -p /app/backend/uploads && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health/ready || exit 1

CMD ["node", "backend/src/server.js"]
