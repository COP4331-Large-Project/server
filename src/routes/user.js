import express from 'express';
import User from '../controllers/user';

const router = express.Router();

// TODO: Add Swagger Docs

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
    if (err) return res.status(500).send(err);
    return res.send(result);
  });
});
router.post('/', User.register);

// TODO: Add Swagger Docs

router.post('/login', User.login);

export default router;
