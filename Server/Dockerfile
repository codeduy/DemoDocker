# Dockerfile for Node.js Server
FROM node:18 AS server

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Start the server
CMD ["node", "server.js"]  
