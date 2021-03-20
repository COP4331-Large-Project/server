import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpecs = () => {
  const options = {
    definition: {
      openapi: '3.0.3',
      swagger: '3.0.3',
      info: {
        title: 'ImageUs API',
        description: 'This is the ImageUs API documentation',
        license: {
          name: 'MIT',
          url: 'https://spdx.org/licenses/MIT.html',
        },
      },
      servers: [
        {
          url: 'http://localhost:5000/',
          description: 'local server',
        },
      ],
    },
    schemes: ['http'],
    apis: ['./src/routes/user.js', './src/routes/group.js'],
  };

  return swaggerJsdoc(options);
};

export default swaggerSpecs;
