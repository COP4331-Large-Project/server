/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import UserModel from '../models/user';
import GroupModel from '../models/group';
import ImageModel from '../models/image';
import APIError from '../services/APIError';
import PasswordHasher from '../services/PasswordHasher';
import S3 from '../services/S3';
import SendGrid from '../services/SendGrid';
import { logger } from '../globals';
import { createToken } from '../services/JWTAuthentication';
import { groupList } from '../aggregations';
import Group from './group';
import { GroupDocument, UserDocument, ImageDocument } from '../models/doc-types';
import { User } from '../types';


async function sendVerificationEmail(user: UserDocument) {
  const link = `https://www.imageus.io/verify/?id=${user.id}&verificationCode=${user.verificationCode}`;

  try {
    await SendGrid.sendMessage({
      to: user.email,
      from: 'no-reply@imageus.io',
      subject: 'Please Verify Your Account for ImageUs',
      text: `${user.firstName} ${user.lastName},
      Please verify your account by clicking the link below:
      ${link}`,
    });
  } catch (err) {
    throw new APIError(
      'Failed to send email',
      'An error occured while trying to send the email',
      503,
    );
  }
}

const UserController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const {
      firstName, lastName, email, username, password,
    } = req.body;

    // Hash password
    const hashedPassword = await PasswordHasher.hash(password);

    // Verification code
    const verificationCode = uuidv4();
    // create new user model with given request body
    const newUser = new UserModel(
      {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        verificationCode,
      },
    );

    let user;
    try {
      user = await newUser.save();
    } catch (err) {
      // Duplicate Key Error
      if (err.code === 11000) {
        return next(new APIError(
          'Username or email taken',
          'Another username or email with the same name is already in use.',
          409,
        ));
      }
      return next(new APIError());
    }

    // Strip sensitive info
    const reifiedUser = user.toJSON<User>();
    delete reifiedUser.password;

    try {
      await sendVerificationEmail(user);
    } catch (err) {
      return next(err);
    }

    res.status(201).send(reifiedUser);
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    let user;

    try {
      user = (await UserModel.findOne({
        username: req.body.username,
      }, '+password')
        .exec());
    } catch (err) {
      return next(new APIError());
    }

    if (!user || !await PasswordHasher.validateHash(req.body.password, user.password)) {
      return next(new APIError(
        'Incorrect Credentials',
        'Cannot Log user in',
      ));
    }

    if (!user.verified) {
      return next(new APIError(
        'The user is not verified',
        'The user has not verified their email yet',
        401,
      ));
    }

    // Strip sensitive info
    const reifiedUser = user.toJSON<User>();
    delete reifiedUser.password;
    reifiedUser.token = createToken({ id: reifiedUser.id });

    res.status(200).send(reifiedUser);
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    let user;

    try {
      user = await UserModel.findById(id, '+password').exec();

      if (!user || !await PasswordHasher.validateHash(req.body.password, user.password)) {
        return next(new APIError(
          'User not deleted',
          'Either the user does not exist or the given password is incorrect',
          403,
          `/users/${id}/`,
        ));
      }
      const owningGroups = await GroupModel.find({ creator: mongoose.Types.ObjectId(id) }).exec();
      await Promise.all(owningGroups.map(async (x) => {
        req.params.id = x.id;
        req.body.user = id;
        await Group.delete(true)(req, res, next);
      }));

      await ImageModel.deleteMany({ creator: id }).exec();
      await GroupModel.updateMany(
        { invitedUsers: { $in: [id] } },
        { $pull: { invitedUsers: id } },
      ).exec();
      await user.deleteOne();
    } catch (err) {
      next(new APIError());
    }

    res.status(204).send();
  },

  fetch: (internalCall = false) => async (req: Request, res: Response, next: NextFunction): Promise<mongoose.LeanDocument<UserDocument> | void> => {
    const { id } = req.params;
    let result;
    let imgURL;

    try {
      result = await UserModel.findOne({ _id: id }).exec();

      if (!result) {
        return next(new APIError(
          'Could not find User',
          `User with id ${id} could not be found.`,
          404,
          `/users/${id}`,
        ));
      }

      imgURL = await S3.getPreSignedURL(`users/${result.id}/profile.jpeg`);
    } catch (err) {
      logger.error(err);
      return next(new APIError());
    }

    const retVal = result.toJSON();
    retVal.imgURL = imgURL;

    if (!internalCall) {
      res.status(200).send(retVal);
      return;
    }

    return retVal;
  },

  async fetchGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    let groups;
    try {
      groups = (await UserModel.aggregate(groupList(id)).exec() as GroupDocument[]);
    } catch (err) {
      return next(new APIError());
    }

    await Promise.all(groups.map(async group => {
      const copy = group;
      copy.id = group._id;
      delete copy._id;

      if (!copy.thumbnail) {
        copy.thumbnail = null;
        return copy;
      }

      (<User[]> group.invitedUsers).map(user => {
        const userCopy = user;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userCopy.id = user._id!;
        delete userCopy._id;
        return userCopy;
      });

      copy.thumbnail = copy.thumbnail as ImageDocument;

      copy.thumbnail.URL = await S3.getPreSignedURL(`groups/${copy.id}/${copy.thumbnail.fileName}`);

      return copy;
    }));

    res.status(200).send(groups);
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    let result;

    try {
      result = await UserModel.findByIdAndUpdate(id, req.body, { new: true }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!result) {
      return next(new APIError(
        'User could not be found',
        `User with id ${id} was not found`,
        404,
        `users/${id}`,
      ));
    }

    const updatedUser = await UserController.fetch(true)(req, res, next);
    res.status(200).send(updatedUser);
  },

  async uploadProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    // If there was no file attached we're done.
    if (!req.file) {
      return next(new APIError(
        'Could not upload profile photo',
        'The image payload is empty',
      ));
    }

    const imageBuffer = req.file.buffer;

    const key = `users/${id}/profile.jpeg`;
    let imgURL;

    // Tack on image url
    try {
      await S3.uploadObject(key, imageBuffer);
      imgURL = await S3.getPreSignedURL(key);
    } catch (e) {
      return next(new APIError());
    }

    res.status(200).send({ imgURL });
  },

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { verificationCode } = req.body;
    let result;

    try {
      result = await UserModel.findOneAndUpdate({ _id: id, verificationCode },
        { verified: true }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!result) {
      return next(new APIError(
        'User could not be found',
        `User with id ${id} was not found`,
        404,
        `users/${id}/verify`,
      ));
    }

    res.status(200).send(result.toJSON());
  },

  async emailPasswordRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;
    let result;
    const verificationCode = uuidv4();
    try {
      result = await UserModel.findOneAndUpdate({ email }, { verificationCode }).exec();
    } catch (err) {
      return next(new APIError());
    }
    if (!result) {
      return next(new APIError(
        'User could not be found',
        `User with ${email} could not be found`,
        404,
        `users/${email}/passwordRecovery`,
      ));
    }

    const link = `https://www.imageus.io/users/${result.id}/password-reset/?verificationCode=${verificationCode}`;

    SendGrid.sendMessage({
      to: result.email,
      from: 'no-reply@imageus.io',
      subject: 'Password Reset for ImageUs',
      text: 'Please visit the link below to reset your password, if you did not attempt to change your password you can'
          + ' ignore this email.:'
          + `${link}`,
    }).catch((err) => next(new APIError(
      'Failed to send email',
      'An error occured while trying to send the email',
      503,
      err,
    )));

    res.status(200).send(result.toJSON());
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId, verificationCode, password } = req.body;
    try {
      const user = await UserModel.findById(userId).exec();

      if (!user) {
        return next(new APIError(
          'Password not reset',
          'The given id does not represent a valid user',
          404,
        ));
      }

      if (user.verificationCode !== verificationCode) {
        return next(new APIError(
          'Password not reset',
          'The verification code is invalid',
          403,
        ));
      }

      const hashedPassword = await PasswordHasher.hash(password);
      await user.updateOne({ password: hashedPassword }).exec();
      res.status(204).send();
    } catch (err) {
      return next(new APIError(undefined, undefined, undefined, err));
    }
  },

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;

    let user;

    try {
      user = await UserModel.findOne({ email }).exec();
    } catch (err) {
      return next(new APIError());
    }

    if (!user) {
      return next(new APIError(
        'User Could not be found',
        'No such User exists',
        404,
      ));
    }

    try {
      await sendVerificationEmail(user.toJSON<UserDocument>());
    } catch (err) {
      return next(err);
    }

    res.status(204).send();
  },
};

export default UserController;
