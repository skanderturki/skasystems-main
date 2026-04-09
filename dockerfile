# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy package files first
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the React application (CRA outputs to /app/build)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built React app, server, and node_modules from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server.js ./server.js

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start Node server (serves build/ and handles /api/contact)
CMD ["node", "server.js"]
