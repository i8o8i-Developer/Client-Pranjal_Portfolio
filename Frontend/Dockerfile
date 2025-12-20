# Build Stage
FROM node:18-alpine AS build

# Set Working Directory
WORKDIR /app

# Copy Package Files
COPY package*.json ./

# Install Dependencies
RUN npm ci --only=production

# Copy Source Code
COPY . .

# Build The Application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy Built Application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx Configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose Port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]