# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Debug: List contents of current directory
RUN ls -la

# Copy package files first
COPY package*.json ./

# Debug: Verify package.json was copied
RUN ls -la

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Debug: List contents after copying all files
RUN ls -la
RUN ls -la public/

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY react-nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]