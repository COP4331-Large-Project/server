import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// add a new user
router.post('/', async (req, res) => {
  // create new user model with given request body
  const newUser = new User(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
    },
  );
  await newUser.saveUser((err, result) => {
    if (err) return res.status(500).send('TODO ERROR');
    return res.send(result);
  });
});

// should add password checking
router.post('/login', async (req, res) => {
  const user = new User(
    {
      username: req.body.username,
      password: req.body.password,
    },
  );
  user.findOne({ username: user.username }).then(existingUser => {
    if (!existingUser) {
      // the error should be redone, probably with some error library
      return res.status(404).json({ usernotfound: 'User not found' });
    }
    return res.send(existingUser);
  });
});

export default router;
