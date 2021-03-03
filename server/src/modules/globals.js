import path from 'path';
import pino from 'pino';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const logger = pino();

export { __dirname, logger };
