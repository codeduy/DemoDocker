# Dockerfile for Vite + React
FROM node:18 AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

EXPOSE 3001

# Start the application
CMD ["npm", "run", "preview"]
