# Multi-stage build for Angular application

# Stage 1: Build the Angular app
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

RUN mkdir -p /etc/nginx/snippets

# Copy custom nginx configuration
COPY nginx-rate-limit.conf /etc/nginx/conf.d/00-rate-limit.conf
COPY proxy-api.conf /etc/nginx/snippets/proxy-api.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
