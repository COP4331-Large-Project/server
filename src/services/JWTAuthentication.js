import jwt from 'jsonwebtoken';
import APIError from './APIError';

const defaultExpireTime = 1000 * 60 * 15;

const createToken = (payload, expiresIn = defaultExpireTime) => {
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    return next(new APIError(
      'Invalid authorization header',
      'The authorization header does not exist.',
      403,
    ));
  }
  const bearer = bearerHeader.split('');
  const token = bearer[1];
  req.token = token;
  return next();
};

const authenticate = (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new APIError(
        'Invalid JWT token',
        'The given token failed to verify as a valid token',
        403,
      ));
    }

    if (decoded.id !== req.params.id) {
      return next(new APIError(
        'Unauthorized',
        'The requesting user is not the same one found in the given token',
        401,
      ));
    }

    return next();
  });
};

export { createToken, ensureToken, authenticate };
