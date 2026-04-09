# Build stage for client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy client built files
COPY --from=client-builder /app/client/dist ./client/dist

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Environment variables
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Start the server
WORKDIR /app/server
CMD ["node", "src/server.js"]
