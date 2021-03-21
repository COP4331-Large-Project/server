/**
 * @swagger
 * tags:
 *    name: User
 *    description: API to manage users.
 */

import express from 'express';
import User from '../controllers/user';

const router = express.Router();

/**
 * @swagger
 * path:
 * /users/:
 *    post:
 *      description: Creates a new user
 *      summary: Creates a user
 *      tags:
 *        - User
 *
 *      requestBody:
 *        description:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: jbrown
 *                password:
 *                  type: string
 *                  example: password12345
 *                firstName:
 *                  type: string
 *                  example: John
 *                lastName:
 *                  type: string
 *                  example: Brown
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *        404:
 *          description: Username already exists
 *        500:
 *          description: Internal error
 */
router.post('/', User.register);

/**
 * @swagger
 * path:
 * /users/login:
 *    post:
 *      description: Logs in an existing user
 *      summary: Logs in a user
 *      tags:
 *        - User
 *
 *      requestBody:
 *        description:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: jbrown
 *                password:
 *                  type: string
 *                  example: password12345
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *        404:
 *          description: Username/password combination is incorrect
 *        500:
 *          description: Internal error
 */
router.post('/login', User.login);

router.delete('/:userID', User.delete);
router.get('/:id', User.fetch);

export default router;
