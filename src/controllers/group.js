/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { Image as ImageModel, Group as GroupModel } from '../models/group';
import UserModel from '../models/user';
import APIError from '../services/APIError';
import S3 from '../services/S3';

const { ObjectId } = mongoose.Types;

const Group = {
  register: async (req, res, next) => {
    const {
      users, creator, invitedUsers, publicGroup, name,
    } = req.body;
    const newGroup = new GroupModel(
      {
        users, creator, invitedUsers, publicGroup, name,
      },
    );

    try {
      newGroup.inviteCode = uuidv4();
      const group = await newGroup.save();
      return res.status(200).send(group.toJSON());
    } catch (err) {
      return next(new APIError());
    }
  },

  join: async (req, res, next) => {
    const { inviteCode } = req.params;
    let group = (await GroupModel
      .findOne({ inviteCode })
      .exec());

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

    if (group.creator._id.equals(user._id)) {
      return res.status(204).send(group.toJSON());
    }

    const authorizedUser = (group.invitedUsers).some(x => x.equals(user));

    if (authorizedUser) {
      await UserModel.findByIdAndUpdate(user, { $push: { groups: group._id } }).exec();
      // remove user from group's invited users array
      await group.update({ $pull: { invitedUsers: user } });
      // put user into group's user array
      await group.update({ $push: { users: user } });
      // get updated group information
      group = (await GroupModel
        .findOne({ inviteCode })
        .exec());
      return res.status(200).send(group.toJSON());
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
    // eslint-disable-next-line max-len
    for (let i = 0; i < result.images.length; i += 1) {
      result.images[i].URL = await S3.getPreSignedURL(`groups/${result._id}/${result.images[i].fileName}`);
    }
    result = result.toJSON();
    [result.thumbnail] = result.images;
    return res.status(200).send(result);
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

    const { caption } = req.body;
    const image = new ImageModel({
      fileName,
      caption,
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

    if (!result) {
      return next(new APIError(
        'Group photo could not be uploaded.',
        'No such Group exists',
        404,
        `/groups/${id}/`,
      ));
    }

    image.URL = await S3.getPreSignedURL(key);

    return res.status(204).send(image);
  },

  update: async (req, res, next) => {
    const { id } = req.params;

    try {
      await GroupModel.findByIdAndUpdate(
        id,
        req.body,
      );
    } catch (err) {
      if (err.code === 11000) {
        return next(new APIError(
          'Name is taken',
          'The name you provided is already taken.',
          409,
        ));
      }

      return next(new APIError());
    }

    return res.status(204).send();
  },

  thumbnail: async (req, res, next) => {
    const { id } = req.params;
    let group;

    try {
      group = await GroupModel.findOne({ _id: id }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!group) {
      return next(new APIError(
        'Could not find Group',
        `Group with id ${id} could not be found.`,
        404,
        `/groups/${id}`,
      ));
    }

    if (group.images.length === 0) {
      return next(new APIError(
        'No image to show',
        `Group with id ${id} does not have any images.`,
        404,
        `/groups/${id}`,
      ));
    }
    // eslint-disable-next-line max-len
    const image = group.images[0];
    image.URL = await S3.getPreSignedURL(`groups/${group._id}/${image.fileName}`);
    return res.status(200).send(image);
  },
};

export default Group;
