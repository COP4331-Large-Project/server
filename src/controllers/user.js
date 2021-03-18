import UserModel from '../models/user';
import { objectOptions } from './constants';
import APIError from '../services/APIError';

const User = {
  register: async (req, res, next) => {
    // create new user model with given request body
    const newUser = new UserModel(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
      },
    );

    // TODO: Hashing.

    try {
      const user = await newUser.save().toObject(objectOptions);
      return res.status(201).send(user);
    } catch (err) {
      return next(new APIError(err));
    }
  },

  login: async (req, res, next) => {
    let user;
    try {
      // TODO: Hashing.
      user = (await UserModel.findOne({
        username: req.body.username,
        password: req.body.password,
      })
        .exec());
    } catch (err) {
      return next(new APIError());
    }

    if (!user) {
      return next(new APIError(
        'Invalid Login',
        `Cannot login user: ${req.body.username}`,
      ));
    }

    return res.status(200).send(user.toObject(objectOptions));
  },
};

export default User;
