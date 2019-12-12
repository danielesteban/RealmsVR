const bodyParser = require('body-parser');
const colors = require('colors/safe');
const cors = require('cors');
const express = require('express');
const expressWS = require('express-ws');
const helmet = require('helmet');
const mongoose = require('mongoose');
const multer = require('multer');
const config = require('./config');
const populate = require('./services/population');
const setupEndpoints = require('./endpoints');
const { setup: setupErrorHandler } = require('./services/errorHandler');
const { setup: setupPassport } = require('./services/passport');
const setupSwagger = require('./services/swagger');

// Setup mongoose
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connection.on('error', console.error);
mongoose.connection.on('disconnected', () => mongoose.connect(config.mongoURI));
mongoose.connect(config.mongoURI);

// Populate db
if (!config.production && !config.test) {
  mongoose.connection.once('connected', () => (
    populate()
  ));
}

// Setup express
const api = express();
expressWS(api);
api.set('trust proxy', 'loopback');
api.set('multer', multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1048576, // 1mb
  },
}));
api.use(bodyParser.json({
  limit: '1mb',
}));
api.use(cors());
if (config.production) {
  api.use(helmet());
}
setupPassport();
setupEndpoints(api);
setupSwagger(api);
setupErrorHandler(api);
const server = api.listen(config.port, config.production ? '0.0.0.0' : '127.0.0.1', () => {
  if (!config.production) {
    const { address, port } = server.address();
    console.log(colors.yellow(`Listening on: http://${address}:${port}/`));
  }
});

// Graceful shutdown
const shutdown = () => (
  server.close(() => (
    mongoose.connection.close(
      false,
      () => process.exit(0)
    )
  ))
);
process
  .on('SIGTERM', shutdown)
  .on('SIGINT', shutdown);

module.exports = api;
