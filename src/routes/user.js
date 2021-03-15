import express from 'express';
import User from '../models/user';

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

router.post('/login', async (req, res) => {
  const user = new User(
    {
      username: req.body.username,
      password: req.body.password,
    },
  );
  await user.loginUser(req.body.username, req.body.password, (err, result) => {
    if (err) return res.status(404).send('User/password combination is incorrect');
    return res.send(result);
  });
});

export default router;
