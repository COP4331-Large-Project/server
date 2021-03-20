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
 *              type: object
 *              properties:
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
groups.post('/', Group.register);

// join an existing group, given by :inviteCode
groups.post('/join/:inviteCode', Group.join);

export default groups;
