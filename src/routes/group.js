/**
 * @swagger
 * tags:
 *    name: Group
 *    description: API to manage groups.
 */

import express from 'express';
import Group from '../controllers/group';

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
 *      requestBody:
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
 *                userID:
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

export default groups;
