import UserModel from '../models/user';
import { objectOptions } from './constants';
import APIError from '../services/APIError';
import PasswordHasher from '../services/PasswordHasher';

const User = {
  register: async (req, res, next) => {
    const {
      firstName, lastName, username, password,
    } = req.body;

    // Hash password
    const hashedPassword = await PasswordHasher.hash(password);

    // create new user model with given request body
    const newUser = new UserModel(
      {
        firstName,
        lastName,
        username,
        password: hashedPassword,
      },
    );

    let user;
    try {
      user = await newUser.save();
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

    // Strip sensitive info
    const reifiedUser = user.toJSON(objectOptions);
    delete reifiedUser.password;

    return res.status(201).send(reifiedUser);
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

  delete: async (req, res, next) => {
    const { userID } = req.params;

    try {
      await UserModel.findOneAndDelete({ _id: userID });
    } catch (err) {
      next(new APIError());
    }

    return res.status(204);
  },
};

export default User;
