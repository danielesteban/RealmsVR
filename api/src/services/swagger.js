const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    components: {
      securitySchemes: {
        SessionToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    basePath: '/',
    servers: [
      {
        url: 'http://localhost:8081/',
        description: 'Local server (dev environment)',
      },
      {
        url: 'https://projects.gatunes.com/realmsvr/',
        description: 'Production server (uses live data)',
      },
    ],
    security: [
      {
        SessionToken: [],
      },
    ],
  },
  apis: [path.join(__dirname, '..', 'endpoints', 'index.js')],
});

module.exports = (api) => {
  api.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
