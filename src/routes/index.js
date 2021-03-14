import express from 'express';
import userRouter from './user';
import groups from './group';

const router = express.Router();

// Add all the routes in.
router.use('/users', userRouter);
router.use('/groups', groups);

export default router;
