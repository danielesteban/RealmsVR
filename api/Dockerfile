FROM node:dubnium

# Set timezone
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Madrid /etc/localtime

# Install forever
ENV NODE_ENV=production
RUN yarn global add forever

# Create working directory
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

# Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install

# Bundle app source
COPY src/ src/

# De-escalate privileges
USER node

# Start server
CMD [ "forever", "src/index.js" ]
