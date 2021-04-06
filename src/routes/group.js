/**
 * @swagger
 * tags:
 *    name: Group
 *    description: API to manage groups.
 */

import express from 'express';
import multer from 'multer';
import Group from '../controllers/group';

const upload = multer({ storage: multer.memoryStorage() });
const groups = express.Router();

/**
 * @swagger
 * path:
 * /groups/{id}:
 *    get:
 *      description: Fetches a group
 *      summary: Fetches a group with the given id
 *      tags:
 *        - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The ID of the group to fetch.
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Group'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.get('/:id', Group.fetch);

/**
 * @swagger
 * path:
 * /groups/thumbnail/{id}:
 *    get:
 *      description: Gets a group thumnail
 *      summary: Fetches the most recently uploaded picture
 *      tags:
 *        - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The ID of the group to fetch from
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Image'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
// groups.get(':/thumbnail/:id', Group.thumbnail);

/**
 * @swagger
 * path:
 * /groups/:
 *    post:
 *      description: Creates a new group
 *      summary: Creates a group
 *      tags:
 *        - Group
 *
 *      requestBody:
 *        description:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GroupRequest'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Group'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.post('/', Group.register);

/**
 * @swagger
 * path:
 * /groups/{id}:
 *    delete:
 *      description: Deletes a group
 *      summary: Deletes a group with the given id
 *      tags:
 *        - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The ID of the group to delete.
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: Successfully Deleted
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.delete('/:id', Group.delete);

/**
 * @swagger
 * path:
 * /groups/{inviteCode}:
 *    post:
 *      description: Joins a group
 *      summary: Join a group with the given invite code
 *      tags:
 *        - Group
 *
 *      parameters:
 *        - in: path
 *          name: inviteCode
 *          required: true
 *          schema:
 *           type: string
 *          description: The invite code of the group to join.
 *
 *      requestBody:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  type: String
 *                  example: 5424dfae4eb45345bc13b778
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Group'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.post('/join/:inviteCode', Group.join);

/**
 * @swagger
 * path:
 * /groups/{id}:
 *    put:
 *      description: Uploads an image to a group
 *      summary: Upload an image to a group
 *      tags:
 *      - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the group to upload the picture to
 *
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#/components/schemas/GroupUpload'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Group'
 *        404:
 *          description: Invalid Group ID
 *        415:
 *          description: File not provided
 */
groups.put('/:id', upload.single('groupPicture'), Group.upload);

export default groups;
