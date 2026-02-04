FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/server.js"]
