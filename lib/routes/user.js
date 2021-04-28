"use strict";
/**
 * @swagger
 * tags:
 *    name: User
 *    description: API to manage users.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const user_1 = __importDefault(require("../controllers/user"));
const JWTAuthentication_1 = require("../services/JWTAuthentication");
const upload = multer_1.default({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
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
router.post('/', user_1.default.register);
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
router.post('/login', user_1.default.login);
/**
 * @swagger
 * path:
 * /users/{id}:
 *    delete:
 *      description: Deletes a user
 *      summary: Deletes a user, given their id and valid password. Also deletes their owned groups
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
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                password:
 *                  type: string
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: No Content
 *        403:
 *          description: Either the user does not exist or the given password is incorrect
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.delete('/:id', (req, res, next) => { JWTAuthentication_1.authenticate(req, res, next, { id: req.params.id }); }, user_1.default.delete);
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
router.get('/:id', (req, res, next) => { JWTAuthentication_1.authenticate(req, res, next, { id: req.params.id }); }, user_1.default.fetch(false));
/**
 * @swagger
 * path:
 * /users/resetPassword:
 *   post:
 *     description: Reset the password of the user
 *     summary: 'Given a valid verification code and user attached to the given email,
 *       the user''s password will be reset'
 *     tags:
 *     - User
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 7834dfae4eb89145bc13b559
 *               verificationCode:
 *                 type: string
 *                 format: uuid
 *               password:
 *                 type: string
 *
 *     produces:
 *       - application/json
 *     responses:
 *       204:
 *         description: OK
 *       403:
 *         description: Incorrect verification code
 *       404:
 *         description: Could not find user
 */
router.post('/resetPassword', user_1.default.resetPassword);
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
router.put('/:id', (req, res, next) => { JWTAuthentication_1.authenticate(req, res, next, { id: req.params.id }); }, user_1.default.update);
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
router.put('/:id/profile', (req, res, next) => { JWTAuthentication_1.authenticate(req, res, next, { id: req.params.id }); }, upload.single('avatar'), user_1.default.uploadProfile);
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
router.post('/:id/verify', user_1.default.verify);
/**
 * @swagger
 * path:
 * /users/passwordRecovery:
 *   post:
 *     description: Send the password recovery link to user's email
 *     summary: Send password recovery link
 *     tags:
 *     - User
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
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
router.post('/passwordRecovery', user_1.default.emailPasswordRecovery);
/**
 * @swagger
 * path:
 * /users/resendVerificationEmail:
 *   post:
 *     description: Sends a verification link to user's email
 *     summary: Send a verification link
 *     tags:
 *     - User
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
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
 *       default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.post('/resendVerificationEmail', user_1.default.resendVerificationEmail);
/**
 * @swagger
 * path:
 * /users/{id}/groups:
 *   get:
 *     description: Gets the groups associated with the user.
 *     summary: Get the User's groups
 *     tags:
 *     - User
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       404:
 *         description: Could not find user
 *       503:
 *         description: Failure to send email
 *       default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
router.get('/:id/groups', user_1.default.fetchGroups);
exports.default = router;
