import { logger } from '../globals';

const ErrorHandler = function handleError(err, req, res, next) {
  res.status(err.status).send({
    status: err.status,
    title: err.title,
    description: err.description,
    instance: err.instance,
  });

  // Log the error to console only for debugging purposes
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err);
  }

  next();
};

export default ErrorHandler;