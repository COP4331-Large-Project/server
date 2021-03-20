import UserModel from '../models/user';
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
    const reifiedUser = user.toJSON();
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
    const reifiedUser = user.toJSON();
    delete reifiedUser.password;

    return res.status(200).send(reifiedUser);
  },

  delete: async (req, res, next) => {
    const { id } = req.params;

    try {
      await UserModel.findOneAndDelete({ _id: id });
    } catch (err) {
      next(new APIError());
    }

    return res.status(204);
  },

  fetch: async (req, res, next) => {
    const { id } = req.params;
    let result;

    try {
      result = await UserModel.findOne({ _id: id }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!result) {
      return next(new APIError(
        'Could not find User',
        `User with id ${id} could not be found.`,
        404,
        `/users/${id}`,
      ));
    }

    return res.status(200).send(result.toJSON());
  },
};

export default User;
