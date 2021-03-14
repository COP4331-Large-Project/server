import express from 'express';
import userRouter from './user.js';

const router = express.Router();

// Add all the routes in.
router.use('/users', userRouter);

export default router;
