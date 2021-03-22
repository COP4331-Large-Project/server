import swaggerJsdoc from 'swagger-jsdoc';
import yaml from 'js-yaml';
import fs from 'fs';
import APIError from './APIError';

const swaggerSpecs = () => {
  let schema;
  try {
    schema = yaml.load(fs.readFileSync('./src/schemas.yml', 'utf8'));
  } catch (e) {
    return new APIError();
  }

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
        {
          url: 'https://api.imageus.io/',
          description: 'production server',
        },
      ],
    },
    components: {
      schemas: schema,
    },
    schemes: ['http'],
    apis: ['./src/routes/user.js', './src/routes/group.js'],
  };

  return swaggerJsdoc(options);
};

export default swaggerSpecs;
