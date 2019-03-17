const bodyParser = require('body-parser');
const colors = require('colors/safe');
const cors = require('cors');
const express = require('express');
const expressWS = require('express-ws');
const helmet = require('helmet');
const mongoose = require('mongoose');
const config = require('./config');
const population = require('./services/population');
const setupEndpoints = require('./endpoints');
const { setup: setupErrorHandler } = require('./services/errorHandler');
const { setup: setupPassport } = require('./services/passport');
const setupSwagger = require('./services/swagger');

// Setup mongoose
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.connection.on('error', console.error);
mongoose.connection.on('disconnected', () => mongoose.connect(config.mongoURI));
mongoose.connect(config.mongoURI);

// Setup express
const api = express();
expressWS(api);
api.set('trust proxy', 'loopback');
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
const server = api.listen(config.port, () => {
  if (!config.production) {
    console.log(colors.yellow(`Listening on: http://localhost:${config.port}/`));
    population();
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
