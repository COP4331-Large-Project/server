import express from 'express';
import User from '../controllers/user';

const router = express.Router();

// TODO: Add Swagger Docs

// add a new user
router.post('/', User.register);

// TODO: Add Swagger Docs

router.post('/login', User.login);

export default router;
