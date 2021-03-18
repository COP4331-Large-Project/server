import express from 'express';
import mongoose from 'mongoose';
import Group from '../controllers/group';

const groups = express.Router();
const { ObjectId } = mongoose.Types;

// TODO: Add Swagger Docs

// add a new group
groups.post('/', async (req, res) => {
  const {
    users, creator, invitedUsers, publicGroup,
  } = req.body;
  const newGroup = new Group(
    {
      users, creator, invitedUsers, publicGroup,
    },
  );
  await newGroup.saveGroup(async (err, result) => {
    if (err) return res.status(500).send(err);
    await result.populate(Group.fieldsToPopulate).execPopulate();
    return res.send(result);
  });
});
groups.post('/', Group.register);

// join an existing group, given by :inviteCode
groups.post('/join/:inviteCode', async (req, res) => {
  const { inviteCode } = req.params;
  const group = await Group.findOne({ inviteCode }).populate(Group.fieldsToPopulate);
  if (group === null) {
    return res.status(404).send({ message: 'TODO ERROR: GROUP DOES NOT EXIST' });
  }
  if (group.publicGroup) {
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
  return res.status(404).send({ message: 'TODO ERROR: USER DOES NOT HAVE PERMISSION' });
});

export default groups;
