# Build stage for client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Build argument for Vite environment variable
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source
COPY client/ ./

# Build client (VITE_GOOGLE_CLIENT_ID will be baked in)
RUN npm run build

# Build stage for server
FROM node:20-alpine AS server-builder

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci

# Copy server source
COPY server/ ./

# Build server
RUN npm run build

# Production stage
FROM node:20-alpine

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy server built files and dependencies
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=server-builder /app/server/package*.json ./server/

# Copy schema.sql (not compiled by TypeScript)
COPY --from=server-builder /app/server/src/db/schema.sql ./server/dist/db/

# Copy client built files
COPY --from=client-builder /app/client/dist ./client/dist

# Create directories for data and resources
RUN mkdir -p /app/data /app/resources/galleries

# Copy resources (galleries) if they exist - will be mounted as volume in production
# COPY resources/ ./resources/

# Set working directory to server
WORKDIR /app/server

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
