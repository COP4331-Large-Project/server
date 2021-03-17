import express from 'express';
import mongoose from 'mongoose';
import Group from '../models/group';

const groups = express.Router();
const { ObjectId } = mongoose.Types;

// add a new group
groups.post('/', async (req, res) => {
  const newGroup = new Group(
    {
      users: req.body.users,
      creator: req.body.creator,
      invites: req.body.invites,
      public: req.body.public,
    },
  );
  await newGroup.saveGroup((err, result) => {
    if (err) return res.status(500).send(err);
    return res.send(result);
  });
});

groups.post('/join/:inviteCode', async (req, res) => {
  const { inviteCode } = req.params;
  const group = await Group.findOne({ inviteCode });
  if (group === null) {
    return res.status(404).send({ message: 'TODO ERROR: GROUP DOES NOT EXIST' });
  }
  if (group.public) {
    return res.send({ group, message: 'SUCCESSFULLY JOINED PUBLIC GROUP' });
  }
  if (!ObjectId.isValid(req.body.user)) {
    return res.status(404).send({ message: 'TODO ERROR: BAD USER ObjectId' });
  }
  const user = ObjectId(req.body.user);
  const authorizedUser = (group.users).some(x => x.equals(user));
  if (group.creator.equals(user) || authorizedUser) {
    return res.send({ group, message: 'SUCCESSFULLY AUTHENTICATED' });
  }
  return res.status(404).send('TODO ERROR: USER DOES NOT HAVE PERMISSION');
});

export default groups;
