const mongoose = require('mongoose');
const config = require('../config');
const { Realm } = require('../models');
const Screenshots = require('../services/screenshots');

// Setup mongoose
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.connection.on('error', console.error);
mongoose.connection.on('disconnected', () => mongoose.connect(config.mongoURI));
mongoose.connect(config.mongoURI);

// Fetch realms
Realm
  .find({})
  .sort('-createdAt')
  .then((realms) => {
    // Render realms
    realms.map((realm) => (
      realm
        .updateScreenshot()
    ));
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (Screenshots.queue.length > 0) {
          return;
        }
        Screenshots.browser.pages()
          .then((pages) => {
            if (pages.length > 1) {
              return;
            }
            clearInterval(interval);
            resolve();
          });
      }, 500);
    });
  })
  .then(() => (
    mongoose.connection.close(
      false,
      () => process.exit(0)
    )
  ));
