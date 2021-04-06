import pino from 'pino';
import Socket from './services/Socket';

/**
 * The program wide logger being used.
 *
 * @type {Logger}
 */
const logger = pino();

const SocketInstance = (function () {
  let io;

  function createInstance(app) {
    const instance = new Socket(app);
    return instance;
  }

  return {
    getInstance(app) {
      if (!io && app) {
        io = createInstance(app);
      }
      return io;
    },
  };
});

export { logger, SocketInstance };
