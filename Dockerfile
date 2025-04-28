# Dockerfile (frontend)
FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY vite.config.js .

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite in development mode with hot reloading
CMD ["npm", "run", "dev"]