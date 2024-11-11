# Use the Node.js image from Docker Hub
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 5167

# Define the command to start the app
CMD ["npm", "start"]
