import UserModel from '../models/user';
import { objectOptions } from './constants';
import APIError from '../services/APIError';
import PasswordHasher from '../services/PasswordHasher';

const User = {
  register: async (req, res, next) => {
    // Hash password
    const hashedPassword = await PasswordHasher.hash(req.body.password);

    // create new user model with given request body
    const newUser = new UserModel(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
      },
    );

    try {
      const user = await newUser.save();
      // Strip sensitive info
      const reifiedUser = user.toJSON(objectOptions);
      delete reifiedUser.password;

      return res.status(201).send(reifiedUser);
    } catch (err) {
      // Duplicate Key Error
      if (err.code === 11000) {
        return next(new APIError(
          'Username taken',
          'Another username with the same name is already in use.',
          409,
        ));
      }

      return next(new APIError());
    }
  },

  login: async (req, res, next) => {
    let user;

    try {
      user = (await UserModel.findOne({
        username: req.body.username,
      }, '+password')
        .exec());
    } catch (err) {
      return next(new APIError());
    }

    if (!user || !await PasswordHasher.validateHash(req.body.password, user.password)) {
      return next(new APIError(
        'Incorrect Credentials',
        'Cannot Log user in',
      ));
    }

    // Strip sensitive info
    const reifiedUser = user.toJSON(objectOptions);
    delete reifiedUser.password;

    return res.status(200).send(reifiedUser);
  },
};

export default User;
