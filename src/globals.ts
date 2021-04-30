import pino, { Logger } from 'pino';

/**
 * The program wide logger being used.
 */
const logger: Logger = pino();

export { logger };
