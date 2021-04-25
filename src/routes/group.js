/* eslint-disable max-len */
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
groups.get('/:id', Group.fetch(false));

/**
 * @swagger
 * path:
 * /groups/{id}/thumbnail/:
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
groups.get('/:id/thumbnail/', Group.thumbnail(false));

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
 *      summary: Deletes a group with the given id, also deleting its own reference from involved users
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
groups.delete('/:id', Group.delete(false));

/**
 * @swagger
 * path:
 * /groups/{id}/removeUser:
 *    delete:
 *      description: Remove users from a group
 *      summary: Removes users from a group, also removing the reference to this group in those users
 *      tags:
 *        - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The ID of the group to delete from
 *
 *      requestBody:
 *        description:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RemoveUsers'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: Successfully Removed
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.delete('/:id/removeUser', Group.removeUser);

/**
 * @swagger
 * path:
 * /groups/{inviteCode}/join:
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
groups.post('/:inviteCode/join/', Group.join);

/**
 * @swagger
 * path:
 * /groups/{id}/invite:
 *    post:
 *      description: Invite users to a group
 *      summary: Send an invitation email to each invited member and add a reference to the invited users in the group
 *      tags:
 *        - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *           type: string
 *          description: The id of the group that users are being invited to
 *
 *      requestBody:
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                emails:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: email
 *                  example: ["john@gmail.com", "bob@yahoo.com"]
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: OK
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.post('/:id/invite', Group.inviteUsers(false));

/**
 * @swagger
 * path:
 * /groups/{id}/uploadImage:
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
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.put('/:id/uploadImage', upload.single('groupPicture'), Group.upload);

/**
 * @swagger
 * path:
 * /groups/{id}/deleteImages:
 *    post:
 *      description: Deletes images from a group
 *      summary: Deletes images from a group
 *      tags:
 *      - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the group to delete images from
 *
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              properties:
 *                images:
 *                  type: array
 *                  items:
 *                    type: string
 *                  example: ["607a666651911155a2b15e04", "607a666951911155a2b15e06"]
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: OK
 *        404:
 *          description: Invalid Group ID
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.post('/:id/deleteImages', Group.deleteImages);

/**
 * @swagger
 * path:
 * /groups/{id}:
 *    put:
 *      description: Updates a group
 *      summary: Updates the content of a group
 *      tags:
 *      - Group
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the group to update
 *
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GroupUpdate'
 *
 *      produces:
 *        - application/json
 *      responses:
 *        204:
 *          description: OK
 *        409:
 *          description: Name taken
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.put('/:id', Group.update);

/**
 * @swagger
 * path:
 * /groups/{id}/images:
 *    get:
 *      description: Fetch images
 *      summary: Fetches images from a group
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
 *        201:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                properties:
 *                  images:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Image'
 *        default:
 *          description: Unexpected Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/APIError'
 */
groups.get('/:id/images', Group.getImages);

export default groups;
