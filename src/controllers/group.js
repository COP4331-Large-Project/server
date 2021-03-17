import GroupModel from '../models/group';

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

  // TODO: invite code generation
};

export default Group;
