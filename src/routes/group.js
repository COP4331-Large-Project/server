import express from 'express';
import Group from '../controllers/group';

const groups = express.Router();

// TODO: Add Swagger Docs

groups.get('/:id', Group.fetch);

// add a new group
groups.post('/', Group.register);

groups.delete('/', Group.delete);

// join an existing group, given by :inviteCode
groups.post('/join/:inviteCode', Group.join);

export default groups;
