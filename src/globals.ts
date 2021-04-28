import pino, { Logger } from 'pino';

/**
 * The program wide logger being used.
 */
const logger: Logger = pino();

// eslint-disable-next-line import/prefer-default-export
export { logger };
