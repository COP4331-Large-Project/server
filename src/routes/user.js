/**
 * @swagger
 * tags:
 *    name: User
 *    description: API to manage users.
 */

import express from 'express';
import multer from 'multer';
import User from '../controllers/user';
import { authenticate } from '../services/JWTAuthentication';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @swagger
 * path:
 * /users/:
 *    post:
 *      description: Creates a new user
 *      summary: Creates/Registers a user
 *      tags:
 *        - User
 *
 *      requestBody:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserRequest'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserResponse'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.post('/', User.register);

/**
 * @swagger
 * path:
 * /users/login:
 *    post:
 *      description: Logs an existing user in with the given username and password.
 *      summary: Log in an existing user.
 *      tags:
 *        - User
 *
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserLogin'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserResponse'
 *        404:
 *          description: Username/password combination is incorrect
 *        500:
 *          description: Internal error
 */
router.post('/login', User.login);

/**
 * @swagger
 * path:
 * /users/{id}:
 *    delete:
 *      description: Deletes a user
 *      summary: Deletes a user with the given id
 *      tags:
 *        - User
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: integer
 *          description: The ID of the user to delete.
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: No Content
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.delete('/:id', authenticate, User.delete);

/**
 * @swagger
 * path:
 * /users/{id}:
 *    get:
 *      description: Fetches a User
 *      summary: Fetches a user with the given id
 *      tags:
 *        - User
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The ID of the user to fetch.
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserResponse'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.get('/:id', authenticate, User.fetch);

/**
 * @swagger
 * path:
 * /users/{id}:
 *    put:
 *      description: Updates an existing user.
 *      summary: Update an existing user.
 *      tags:
 *        - User
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: integer
 *          description: The ID of the user to update.
 *
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#/components/schemas/UserUpdate'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserResponse'
 *        404:
 *          description: Username/password combination is incorrect
 *        500:
 *          description: Internal error
 */
router.put('/:id', authenticate, upload.single('avatar'), User.update);

export default router;
