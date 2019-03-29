FROM node:dubnium

# Install puppeteer dependencies
RUN apt update && \
    apt install -y libgtk-3-0 libxtst6 libxss1 libnss3 libasound2

# Install forever
ENV NODE_ENV=production
RUN yarn global add forever

# Set the timezone
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Madrid /etc/localtime

# Create working directory
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

# Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install

# Bundle fonts
COPY fonts/ fonts/

# Bundle app source
COPY src/ src/

# De-escalate privileges
USER node

# Start server
CMD [ "forever", "src/index.js" ]