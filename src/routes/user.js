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
 *           type: string
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
router.delete('/:id', (req, res, next) => { authenticate(req, res, next, { id: req.params.id }); }, User.delete);

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
router.get('/:id', (req, res, next) => { authenticate(req, res, next, { id: req.params.id }); }, User.fetch);

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
 *           type: string
 *          description: The ID of the user to update.
 *
 *      requestBody:
 *        required: true
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
 *        404:
 *          description: User not found
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.put('/:id', (req, res, next) => { authenticate(req, res, next, { id: req.params.id }); }, User.update);

/**
 * @swagger
 * path:
 * /users/{id}/profile:
 *    put:
 *      description: Upload profile picture to user.
 *      summary: Update an existing user with a new profile picture.
 *      tags:
 *        - User
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The ID of the user to upload the profile image to.
 *
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                avatar:
 *                  type: string
 *                  format: binary
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Successfully Uploaded Profile Image
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  imgURL:
 *                      type: string
 *                      example: "https://url/to/profile/image.jpeg"
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.put('/:id/profile', (req, res, next) => { authenticate(req, res, next, { id: req.params.id }); }, upload.single('avatar'), User.uploadProfile);

/**
 * @swagger
 * path:
 * /users/{id}/verify:
 *   post:
 *     description: This route verifies the user
 *     summary: Update the user by changing the verified to true
 *     tags:
 *     - User
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user to be verified
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               verificationCode:
 *                 type: string
 *                 format: uuid
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: Could not find user
 */
router.post('/:id/verify', User.verify);

/**
 * @swagger
 * path:
 * /users/{id}/passwordRecovery:
 *   post:
 *     description: Send the password recovery link to user's email
 *     summary: Send password recovery link
 *     tags:
 *     - User
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user
 *
 *     requestBody:
 *       required: false
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: Could not find user
 *       503:
 *         description: Failure to send email
 */
router.post('/:id/passwordRecovery', User.emailPasswordRecovery);
export default router;
