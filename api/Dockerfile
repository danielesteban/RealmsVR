FROM node:erbium

# Install puppeteer dependencies
RUN apt-get -qq update && \
    apt-get -qq install --no-install-recommends \
    libgtk-3-0 libxtst6 libxss1 libnss3 libasound2 > /dev/null && \
    rm -rf /var/lib/apt/lists/*

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
