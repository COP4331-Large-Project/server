import mongoose from 'mongoose';
import GroupModel from '../models/group';

const { ObjectId } = mongoose.Types;

const Group = {
  register: async (req, res) => {
    const {
      users, creator, invitedUsers, publicGroup,
    } = req.body;
    const newGroup = new GroupModel(
      {
        users, creator, invitedUsers, publicGroup,
      },
    );

    try {
      const group = await newGroup.save();
      await group.populate(GroupModel.fieldsToPopulate).execPopulate();
      return res.send(group);
    } catch (err) {
      return res.status(500).send(err);
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
};

export default Group;
