FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Make port 3000 available
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
