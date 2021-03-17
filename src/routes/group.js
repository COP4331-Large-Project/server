import express from 'express';
import Group from '../controllers/group';

const groups = express.Router();

// TODO: Add Swagger Docs

// add a new group
groups.post('/', Group.register);

export default groups;
