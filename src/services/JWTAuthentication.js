import jwt from 'jsonwebtoken';
import APIError from './APIError';

const defaultExpireTime = 1000 * 60 * 15;

const createToken = (payload, expiresIn = defaultExpireTime) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

const authenticate = (req, res, next) => {
  // get token from header
  const token = req.headers.authorization;
  if (!token) {
    return next(new APIError(
      'Invalid authorization header',
      'Bad authorization header given',
      403,
    ));
  }
  req.token = token;

  // verify the token is valid
  jwt.verify(req.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new APIError(
          'Invalid JWT token',
          'The given token has expired',
          403,
        ));
      }
      return next(new APIError(
        'Invalid JWT token',
        'The given token failed to verify as a valid token',
        403,
      ));
    }
    // verify the token is for the user trying to be acted upon
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

export { createToken, authenticate };
