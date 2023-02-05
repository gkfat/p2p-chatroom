FROM node:16

# Create app directory
WORKDIR /usr/p2p-chatroom-app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Run app
EXPOSE 8080
CMD ["npm","run","dev"]