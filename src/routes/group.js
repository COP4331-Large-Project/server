import express from 'express';
import mongoose from 'mongoose';
import Group, { popAll } from '../models/group';

const groups = express.Router();
const { ObjectId } = mongoose.Types;

// add a new group
groups.post('/', async (req, res) => {
  const newGroup = new Group(
    {
      users: req.body.users,
      creator: req.body.creator,
      invitedUsers: req.body.invites,
      public: req.body.public,
    },
  );
  await newGroup.saveGroup(async (err, result) => {
    if (err) return res.status(500).send(err);
    return res.send(await result.populate(popAll).execPopulate());
  });
});

groups.post('/join/:inviteCode', async (req, res) => {
  const { inviteCode } = req.params;
  const group = await Group.findOne({ inviteCode }).populate('users creator invitedUsers');
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
