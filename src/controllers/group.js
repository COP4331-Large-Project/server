import mongoose from 'mongoose';
import GroupModel from '../models/group';

const { ObjectId } = mongoose.Types;

const Group = {
  register: async (req, res) => {
    const newGroup = new GroupModel(
      {
        inviteCode: req.body.inviteCode,
        users: req.body.users,
        creator: req.body.creator,
        invites: req.body.invites,
      },
    );

    try {
      const group = await newGroup.save();
      res.status(201).send(group);
    } catch (err) {
      res.status(500).send('TODO ERROR');
    }
  },

  join: async (req, res) => {
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
  },

  // TODO: invite code generation
};

export default Group;
