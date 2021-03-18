import express from 'express';
import Group from '../controllers/group';

const groups = express.Router();

// TODO: Add Swagger Docs

// add a new group
groups.post('/', Group.register);

// join an existing group, given by :inviteCode
groups.post('/join/:inviteCode', Group.join);

export default groups;
