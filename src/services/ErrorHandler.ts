import { logger } from '../globals';
import { Request, Response, NextFunction } from 'express';
import APIError from './APIError';

const ErrorHandler = function handleError(err: APIError, req: Request, res: Response, next: NextFunction): void {
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
