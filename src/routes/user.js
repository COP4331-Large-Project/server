import express from 'express';
import User from '../controllers/user';

const router = express.Router();

// TODO: Add Swagger Docs

// add a new user
router.post('/', User.register);

router.get('/:id', User.fetch);

// TODO: Add Swagger Docs

router.post('/login', User.login);

// TODO: Add Swagger Docs

router.delete('/:id', User.delete);

export default router;
