# Build stage — full dev install, runs the CRA production build
FROM node:20-alpine AS build

WORKDIR /app

# Native build tools — some transitive devDependencies may compile gyp modules
RUN apk add --no-cache python3 make g++

# Install all deps (incl. devDependencies) using the lockfile for reproducibility
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Build the React application (CRA outputs to /app/build)
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Production stage — fresh slim image, installs ONLY runtime dependencies.
# This avoids carrying the ~500 MB devDependencies tree (react-scripts,
# tailwindcss, framer-motion, etc.) into the runtime image. The Express
# server only needs the packages declared in `dependencies` that are
# actually imported by server.js: express, express-rate-limit, resend.
# ---------------------------------------------------------------------------
FROM node:20-alpine

WORKDIR /app

# Copy build output + server entrypoint
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/package.json /app/package-lock.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund \
    && npm cache clean --force

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start Node server (serves build/ and handles /api/contact)
CMD ["node", "server.js"]
