/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import GroupModel from '../models/group';
import ImageModel from '../models/image';
import UserModel from '../models/user';
import APIError from '../services/APIError';
import S3 from '../services/S3';

const { ObjectId } = mongoose.Types;

const Group = {
  register: async (req, res, next) => {
    // We will still use req.body.emails!
    const {
      creator, publicGroup, name,
    } = req.body;
    const newGroup = new GroupModel(
      {
        creator, publicGroup, name,
      },
    );
    try {
      newGroup.inviteCode = uuidv4();
      const group = await newGroup.save();
      req.params.id = group._id;
      // req.body.emails is used here!
      await Group.inviteUsers(true)(req, res, next);
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

    if (group.creator && group.creator._id.equals(user._id)) {
      return res.status(204).send(group.toJSON());
    }

    const authorizedUser = (group.invitedUsers).some(x => x.equals(user));

    if (authorizedUser || group.publicGroup) {
      await UserModel.findByIdAndUpdate(user, { $push: { groups: group._id } }).exec();
      // remove user from group's invited users array
      await group.updateOne({ $pull: { invitedUsers: user } });
      // put user into group's user array
      await group.updateOne({ $push: { users: user } });
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

    // We need to use Promise.all() here because it's more performant than using a for
    // loop with `await` on each iteration. In a for-loop with await on every iteration,
    // *each* iteration waits on the prior one to complete. This is slower than making each
    // iteration asynchronous and then waiting for *all* of them to resolve *after* they're
    // all added.
    //
    // source: https://eslint.org/docs/rules/no-await-in-loop
    await Promise.all(result.images.map(async (item) => {
      const itemCpy = item;
      itemCpy.URL = await S3.getPreSignedURL(`groups/${result._id}/${item.fileName}`);
    }));

    result = result.toJSON();
    [result.thumbnail] = result.images;
    return res.status(200).send(result);
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    const user = ObjectId(req.body.user);
    const group = await GroupModel.findById(id).exec();

    if (!group) {
      return next(new APIError(
        'Group could not be deleted',
        'No such Group exists',
        404,
        `/groups/${id}/`,
      ));
    }

    // if the group creator is not truthy, they probably dont exist anymore
    // just let anyone delete the group at that point
    if (group.creator === 'undefined' || group.creator === null || !Object.prototype.hasOwnProperty.call(group, 'creator')) {
      await group.deleteOne();
      return res.status(204).send();
    }

    if (!group.creator._id.equals(user._id)) {
      return next(new APIError(
        'Group could not be deleted',
        'User is not permitted',
        403,
        `/groups/${id}/`,
      ));
    }

    await group.deleteOne();

    return res.status(204).send();
  },

  upload: async (req, res, next) => {
    const { id } = req.params;
    const { userId, caption } = req.body;

    if (!req.file) {
      return next(new APIError(
        'Group Could not upload file',
        'No file provided',
        415,
        `/groups/${id}`,
      ));
    }

    const groupID = ObjectId(id);
    const group = await GroupModel.findById(groupID);

    if (!group) {
      return next(new APIError(
        'Group photo could not be uploaded.',
        'No such Group exists',
        404,
        `/groups/${id}/`,
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
      caption,
      creator: userId,
      groupID,
    });

    try {
      await group.updateOne(
        { $push: { images: image._id } },
        { new: true },
      ).exec();
      await image.save();
    } catch (err) {
      return next(new APIError(
        undefined,
        undefined,
        undefined,
        err,
      ));
    }

    image.URL = await S3.getPreSignedURL(key);

    return res.status(200).send(image);
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
    let thumbnailDoc;

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
    try {
      const imageID = group.images[group.images.length - 1];
      thumbnailDoc = await ImageModel.findOne({ _id: imageID }).exec();
      if (thumbnailDoc === null) return res.status(200).send();
      thumbnailDoc.URL = await S3.getPreSignedURL(`groups/${group._id}/${thumbnailDoc.fileName}`);
    } catch (err) {
      return next(new APIError(
        undefined,
        undefined,
        undefined,
        err,
      ));
    }

    return res.status(200).send(thumbnailDoc);
  },

  getImages: async (req, res, next) => {
    const { id } = req.params;
    const groupID = ObjectId(id);
    let images;

    try {
      const imageRefs = await ImageModel.find({ groupID });
      if (!imageRefs) return res.status(200).send();
      images = await Promise.all(
        imageRefs.map(async (x) => {
          // eslint-disable-next-line no-param-reassign
          const image = x;
          image.URL = await S3.getPreSignedURL(`groups/${image.groupID}/${image.fileName}`);
          return image;
        }),
      );
    } catch (err) {
      return next(new APIError(
        undefined,
        undefined,
        undefined,
        err,
      ));
    }
    return res.status(201).send(images);
  },

  // internalCall is used for the register endpoint so that a http response isnt sent
  inviteUsers: (internalCall = false) => async (req, res, next) => {
    const { id } = req.params;
    const { emails } = req.body;
    const group = (await GroupModel
      .findById(id)
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

    // get object ID of invited users based on given email
    // if the email wasnt found, return null
    let invitedUserIds = await Promise.all(
      emails.map(
        async (x) => {
          const user = await UserModel.findOne({ email: x }).exec();
          if (!user) return null;
          return ObjectId(user._id);
        },
      ),
    );

    // if null, the user wasnt found, so just forget about them
    invitedUserIds = invitedUserIds.filter((x) => x !== null);

    await group.updateOne({ $push: { invitedUsers: invitedUserIds } });

    if (!internalCall) return res.status(204).send();
  },

  removeUsers: async (req, res, next) => {
    const { id } = req.params;
    const users = req.body.users.map((x) => ObjectId(x));
    const group = (await GroupModel
      .findById(id)
      .exec());

    // Check if group is found.
    if (group === null) {
      return next(
        new APIError(
          'User not removed from group',
          'Group does not exist',
          404,
        ),
      );
    }

    // remove user refernces from this group
    await group.updateOne(
      {
        $pull:
        {
          invitedUsers: { $in: users },
          users: { $in: users },
        },
      },
    );

    // remove reference to this group from users
    await UserModel.updateMany(
      { groups: { $in: group._id } },
      { $pull: { groups: group._id } },
    );

    return res.status(204).send();
  },
};

export default Group;
