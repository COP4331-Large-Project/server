import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { singleGroup } from '../aggregations';
import GroupModel from '../models/group';
import ImageModel from '../models/image';
import UserModel from '../models/user';
import APIError from '../services/APIError';
import S3 from '../services/S3';
import SendGrid from '../services/SendGrid';
import { getIo as io } from '../services/Socket';
import { Response, Request, NextFunction } from 'express';
import { GroupDocument, ImageDocument, UserDocument } from '../models/doc-types';

const { ObjectId } = mongoose.Types;

const Group = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      // Add the creator to the group.
      await GroupModel.findByIdAndUpdate(group, { $push: { users: creator } }).exec();
      // Push the ID on the user model.
      await UserModel.findByIdAndUpdate(creator, { $push: { groups: group._id } }).exec();
      res.status(200).send(group.toJSON());
      return;
    } catch (err) {
      return next(new APIError('Group Creation Failed',
        'Failed to create the group',
        500,
        err));
    }
  },

  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { inviteCode } = req.params;
    const userID = req.body.user;
    let group = (await GroupModel
      .findOne({ inviteCode })
      .exec());
    const user = (await UserModel
      .findById(userID)
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

    // Check if user was found.
    if (user === null) {
      return next(
        new APIError(
          'User not found',
          'User does not exist',
          404,
        ),
      );
    }

    if ((user.groups as GroupDocument[]).some(x => x.equals(group?._id))) {
      return next(new APIError(
        'Failed to join group',
        'User is already in this group',
        418,
      ));
    }

    const authorizedUser = (group.invitedUsers as UserDocument[]).some(x => x.equals(user._id));

    if (authorizedUser || group.publicGroup) {
      await UserModel.findByIdAndUpdate(user, { $push: { groups: group._id } }).exec();
      // remove user from group's invited users array
      await group.updateOne({ $pull: { invitedUsers: user._id } });
      // get updated group information
      group = (await GroupModel
        .findOne({ inviteCode })
        .exec());
      // we pass 1 as the 'users joined' count just for continuity and future-proofing
      io().to(group?.id).emit('user joined', user.username, group?.id);
      req.params.id = group?.id;
      const result = await Group.fetch(true)(req, res, next);
      res.status(200).send(result);
      return;
    }

    return next(new APIError(
      'Cannot join Group.',
      'User does not have permission to join this group.',
      403,
      `/groups/join/${inviteCode}`,
    ));
  },

  fetch: (internalCall = false) => async (req: Request, res: Response, next: NextFunction): Promise<void | GroupDocument> => {
    const { id } = req.params;
    let result: GroupDocument;

    try {
      [result] = await GroupModel.aggregate(singleGroup(id)).exec();
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

    (result.invitedUsers as UserDocument[]).map(user => {
      const userCopy = user;
      userCopy.id = user._id;
      delete userCopy._id;
      return userCopy;
    });

    result.id = result._id;
    delete result._id;

    result.thumbnail = await Group.thumbnail(true)(req, res, next) as ImageDocument;
    if (!internalCall) {
      res.status(200).send(result);
      return;
    }
    return result;
  },

  delete: (internalCall = false) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const hasCreator = group.creator === undefined || group.creator === null || !Object.prototype.hasOwnProperty.call(group, 'creator');

    const creator = group.creator as UserDocument;
    
    if (hasCreator && !creator._id.equals(user)) {
      return next(new APIError(
        'Group could not be deleted',
        'User is not permitted',
        403,
        `/groups/${id}/`,
      ));
    }

    await group.deleteOne();
    io().in(`${group.id}`).emit('group deleted', group.id);

    if (!internalCall) {
      res.status(204).send();
    }
  },

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    if (!ObjectId.isValid(id)) {
      return next(new APIError(
        'Group photo could not be uploaded.',
        'Bad group id given',
        404,
        `/groups/${id}/uploadImage`,
      ));
    }

    const groupID = ObjectId(id);
    const group = await GroupModel.findById(groupID);

    if (!group) {
      return next(new APIError(
        'Group photo could not be uploaded.',
        'No such Group exists',
        404,
        `/groups/${id}/uploadImage`,
      ));
    }

    const validFileTypes = ['image/jpeg', 'image/gif', 'image/jpg', 'image/png'];
    if (!validFileTypes.some((x) => x === req.file?.mimetype)) {
      return next(new APIError(
        'Media not uploaded',
        'The uploaded media is not of a supported type',
        415,
      ));
    }

    const imageBuffer = req.file.buffer;

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
      await group.updateOne({ thumbnail: image._id }).exec();
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

    const user = await UserModel.findById(userId).exec();

    if (user === null) {
      return next(new APIError());
    }

    io().in(`${group.id}`).emit('image uploaded', image, user.username, group.id);
    res.status(200).send(image);
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    res.status(204).send();
  },

  thumbnail: (internalCall = false) => async (req: Request, res: Response, next: NextFunction): Promise<void | ImageDocument> => {
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

    if (!group.thumbnail) {
      return next(new APIError(
        'No image to show',
        `Group with id ${id} does not have any images.`,
        404,
        `/groups/${id}`,
      ));
    }

    try {
      thumbnailDoc = await ImageModel.findById(group.thumbnail);
      if (!thumbnailDoc) {
        if (!internalCall) {
          res.status(200).send();
          return;
        }
        return undefined;
      }
      thumbnailDoc.URL = await S3.getPreSignedURL(thumbnailDoc.key ?? '');
    } catch (err) {
      return next(new APIError(
        undefined,
        undefined,
        undefined,
        err,
      ));
    }

    if (!internalCall) {
      res.status(200).send(thumbnailDoc);
      return;
    } 
    return thumbnailDoc;
  },

  async getImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    let images;

    try {
      const imageRefs = await ImageModel.find({ groupID: id });
      if (!imageRefs) {
        res.status(201).send({ images });
        return;
      } 
      images = await Promise.all(
        imageRefs.map(async (x) => {
          // eslint-disable-next-line no-param-reassign
          const image = x;
          image.URL = await S3.getPreSignedURL(image.key ?? '');
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

    res.status(201).send({ images });
  },

  async deleteImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    // array of image ids
    const { images } = req.body as { images: string[] };
    const { id } = req.params;
    let group: GroupDocument | null;

    try {
      group = await GroupModel.findById(id).exec();
    } catch (err) {
      return next(new APIError(
        undefined,
        undefined,
        undefined,
        err,
      ));
    }

    if (!group) {
      return next(new APIError(
        'Could not find Group',
        `Group with id ${id} could not be found.`,
        404,
        `/groups/${id}`,
      ));
    }

    try {
      const imageRefs = await ImageModel.find(
        {
          $and: [
            { _id: { $in: images } },
            { groupID: id }],
        },
      ).exec();

      await Promise.all(imageRefs.map(async (image) => {
        await S3.deleteObject(image.key ?? '');
        await image.deleteOne();
      }));
    } catch (err) {
      return next(new APIError(
        undefined,
        undefined,
        undefined,
        err,
      ));
    }
    const thumbnailDeleted = images.filter((x) => (x === group?.thumbnail));

    if (thumbnailDeleted.length === 1) {
      const groupImages = await ImageModel.find({ groupID: id }).exec();
      if (groupImages.length !== 0) {
        groupImages.sort((a, b) => b.dateUploaded.getTime() - a.dateUploaded.getTime());
        await group.updateOne({ thumbnail: groupImages[0] }).exec();
      } else {
        await group.updateOne({ thumbnail: null }).exec();
      }
    }

    res.status(200).send();
  },

  // internalCall is used for the register endpoint so that a http response isnt sent
  inviteUsers: (internalCall = false) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { emails }: { emails: string[] } = req.body;
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
    const invitedUsers = await Promise.all(
      emails.map(
        async (x) => {
          const user = await UserModel.findOne({ email: x }).exec();
          if (!user) return null;
          return user;
        },
      ),
    );

    // if null, the user wasnt found, so just forget about them
    const filteredUsers = invitedUsers.filter((x) => x !== null);

    await group.updateOne({ $push: { invitedUsers: filteredUsers } });

    filteredUsers.forEach((user) => {
      const link = `https://www.imageus.io/invite/${group.inviteCode}?userId=${user?.id}&groupId=${group.id}`;
      SendGrid.sendMessage({
        to: user?.email,
        from: 'no-reply@imageus.io',
        subject: `You have been invited to join ${group.name}`,
        text: `To accept your invite to the group, click the link below:
      ${link}`,
      }).catch((err) => next(new APIError(
        'Failed to send email',
        'An error occurred while trying to send the email',
        503,
        err,
      )));
    });

    if (!internalCall) {
      res.status(204).send();
    }
  },

  async removeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    let { user } = req.body;
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

    user = await UserModel.findById(user).exec();

    if (!user) {
      return next(
        new APIError(
          'User not removed from group',
          'User does not exist',
          404,
        ),
      );
    }

    // remove user refernces from this group
    await group.updateOne(
      { $pull: { invitedUsers: user._id } },
    ).exec();

    // remove reference to this group from the user
    await user.updateOne(
      { $pull: { groups: group._id } },
    ).exec();

    io().to(group.id).emit('user removed', user.username, group.id);
    res.status(204).send();
  },
};

export default Group;
