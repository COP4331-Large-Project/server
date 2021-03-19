import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { objectOptions } from './constants';
import GroupModel from '../models/group';
import APIError from '../services/APIError';

const { ObjectId } = mongoose.Types;

const Group = {
  register: async (req, res, next) => {
    const {
      users, creator, invitedUsers, publicGroup,
    } = req.body;
    const newGroup = new GroupModel(
      {
        users, creator, invitedUsers, publicGroup,
      },
    );

    try {
      newGroup.inviteCode = uuidv4();
      const group = await newGroup.save();
      await group.populate(GroupModel.fieldsToPopulate).execPopulate();
      return res.send(group);
    } catch (err) {
      return next(new APIError());
    }
  },

  join: async (req, res, next) => {
    const { inviteCode } = req.params;
    const group = await GroupModel.findOne({ inviteCode }).populate(GroupModel.fieldsToPopulate)
      .toObject(objectOptions);

    // Check if group is found.
    if (group === null) {
      return next(
        new APIError(
          'Group not found',
          'Group does not exist',
          404,
        ),
      );
    }

    // Check if user is authorized to join.
    if (!ObjectId.isValid(req.body.user)) {
      return next(new APIError(
        'Bad User ObjectId',
        'The given ObjectId for the joining user is invalid',
        404,
        `/groups/join/${inviteCode}`,
      ));
    }
    const user = ObjectId(req.body.user);
    const authorizedUser = (group.users).some(x => x.equals(user));

    if (group.creator.equals(user) || authorizedUser) {
      return res.status(204).send({ group, message: 'SUCCESSFULLY AUTHENTICATED' });
    }

    return next(new APIError(
      'Cannot join Group.',
      'User does not have permission to join this group.',
      403,
      `/groups/join/${inviteCode}`,
    ));
  },
};

export default Group;
