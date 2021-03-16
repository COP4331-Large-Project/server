import express from 'express';
import Group from '../models/group';

const groups = express.Router();

// add a new group
groups.post('/', async (req, res) => {
  const newGroup = new Group(
    {
      inviteCode: req.body.inviteCode,
      users: req.body.users,
      creator: req.body.creator,
      invites: req.body.invites,
    },
  );
  await newGroup.saveGroup((err, result) => {
    if (err) return res.status(500).send(err);
    return res.send(result);
  });
});

groups.post('/join/:inviteCode', async (req, res) => {
  const { inviteCode, user } = req.params;
  const group = await Group.findOne({ inviteCode });
  res.send(group);
});

export default groups;
