import express from 'express';
import Group from '../models/group';
import { logger } from '../globals';

const groups = express.Router();

// add a new group
groups.post('/', async (req, res) => {
  const newGroup = new Group(
    {
      users: req.body.users,
      creator: req.body.creator,
      invites: req.body.invites,
      publicGroup: req.body.publicGroup,
    },
  );
  await newGroup.saveGroup((err, result) => {
    if (err) return res.status(500).send(err);
    return res.send(result);
  });
});

groups.post('/join/:inviteCode', async (req, res) => {
  const { inviteCode } = req.params;
  const { user } = req.body;
  const group = await Group.findOne({ inviteCode });
  logger.info({
    inviteCode, user, group, CREAT: group.creator,
  });
  if (group.creator.toString() !== user) {
    return res.status(404).send('TODO ERROR: UNAUTHORIZED USER');
  }
  return res.send({ group, reqmessage: 'SUCCESSFULLY AUTHENTICATED' });
});

export default groups;
