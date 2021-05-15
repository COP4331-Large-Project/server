import swaggerJsdoc from 'swagger-jsdoc';
import yaml from 'js-yaml';
import fs from 'fs';
import { logger } from '../globals';

const swaggerSpecs = (): Record<string, unknown> => {
  let schema;
  try {
    schema = yaml.load(fs.readFileSync('./src/schemas.yml', 'utf8'));
  } catch (e) {
    logger.error(e);
  }

  const options = {
    definition: {
      openapi: '3.0.3',
      swagger: '3.0.3',
      info: {
        title: 'ImageUs API',
        version: '1.0',
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
      components: {
        schemas: schema,
      },
    },
    schemes: ['http'],
    apis: ['./src/routes/*.ts'],
  };

  return swaggerJsdoc(options) as Record<string, unknown>;
};

export default swaggerSpecs;
