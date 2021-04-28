import pino from 'pino';

/**
 * The program wide logger being used.
 *
 * @type {Logger}
 */
const logger = pino();

// eslint-disable-next-line import/prefer-default-export
export { logger };
