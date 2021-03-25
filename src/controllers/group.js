import mongoose from 'mongoose';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import GroupModel from '../models/group';
import ImageModel from '../models/image';
import APIError from '../services/APIError';
import S3 from '../services/S3';

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
      return res.send(group.toJSON());
    } catch (err) {
      return next(new APIError());
    }
  },

  join: async (req, res, next) => {
    const { inviteCode } = req.params;
    const groupResult = (await GroupModel
      .findOne({ inviteCode })
      .exec());

    // Check if group is found.
    if (groupResult === null) {
      return next(
        new APIError(
          'Group not found',
          'Group does not exist',
          404,
        ),
      );
    }

    const group = groupResult.toJSON();

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

    // eslint-disable-next-line no-underscore-dangle
    if (group.creator._id.equals(user._id) || authorizedUser) {
      return res.status(204).send();
    }

    return next(new APIError(
      'Cannot join Group.',
      'User does not have permission to join this group.',
      403,
      `/groups/join/${inviteCode}`,
    ));
  },

  fetch: async (req, res, next) => {
    const { id } = req.params;
    let result;

    try {
      result = await GroupModel.findOne({ _id: id }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!result) {
      return next(new APIError(
        'Could not find Group',
        `Group with id ${id} could not be found.`,
        404,
        `/groups/${id}`,
      ));
    }

    return res.status(200).send(result.toJSON());
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    let result;

    try {
      result = await GroupModel.findOneAndDelete({ _id: id }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!result) {
      return next(new APIError(
        'Group Could not be deleted',
        'No such Group exists',
        404,
        `/groups/${id}/`,
      ));
    }

    return res.status(204).send();
  },

  upload: async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.body;
    let result;

    if (!req.file) {
      return next(new APIError(
        'Group Could not upload file',
        'No file provided',
        415,
        `/groups/${id}`,
      ));
    }

    const imageBuffer = await sharp(req.file.buffer)
      .jpeg()
      .toBuffer();
    const fileName = `${uuidv4()}.jpeg`;
    const key = `groups/${id}/${fileName}`;

    try {
      await S3.uploadObject(key, imageBuffer);
    } catch (err) {
      return next(new APIError());
    }

    const image = new ImageModel({
      fileName,
      creator: userId,
      dateUploaded: new Date(),
    });

    try {
      result = await GroupModel.findByIdAndUpdate(
        id,
        { $push: { images: image } },
        { new: true },
      ).exec();
    } catch (err) {
      return next(new APIError());
    }

    return res.status(200).send(result.toJSON());
  },
};

export default Group;
