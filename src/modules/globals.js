import pino from 'pino';
import path from 'path';

/**
 * The program wide logger being used.
 *
 * @type {Logger}
 */
const logger = pino();

/**
 * The top level directory
 *
 * @type {String}
 */
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export { logger, __dirname };
