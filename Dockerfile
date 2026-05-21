# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install dependencies using clean install
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the production application
RUN npm run build

# Serve Stage
FROM nginx:stable-alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from the builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx default port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
