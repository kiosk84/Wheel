FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "start"]
