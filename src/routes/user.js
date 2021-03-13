import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// add a new user
router.post('/', async (req, res) => {
  // create new user model with given request body
  const newUser = new User(
    {
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Username: req.body.Username,
      Password: req.body.Password,
    },
  );
  await newUser.saveUser((err, result) => {
    if (err) return res.status(500).send('TODO ERROR');
    return res.send(result);
  });
});

export default router;
