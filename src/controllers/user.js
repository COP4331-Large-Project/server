import UserModel from '../models/user';

const User = {
  register: async (req, res) => {
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
      const user = await newUser.save();
      return res.status(201).send(user);
    } catch (err) {
      return res.status(500).send('TODO ERROR');
    }
  },

  login: async (req, res) => {
    try {
      // TODO: Hashing.
      const user = await UserModel.findOne({
        username: req.body.username,
        password: req.body.password,
      }).exec();
      return res.status(200).send(user);
    } catch (err) {
      return res.status(500).send('TODO ERROR');
    }
  },
};

export default User;
