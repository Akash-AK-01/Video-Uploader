# Use official Node image
FROM node:18

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Create app directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the backend source code
COPY . .

# Expose port
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
