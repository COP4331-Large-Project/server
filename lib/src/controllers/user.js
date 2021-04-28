"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const uuid_1 = require("uuid");
const user_1 = __importDefault(require("../models/user"));
const group_1 = __importDefault(require("../models/group"));
const image_1 = __importDefault(require("../models/image"));
const APIError_1 = __importDefault(require("../services/APIError"));
const PasswordHasher_1 = __importDefault(require("../services/PasswordHasher"));
const S3_1 = __importDefault(require("../services/S3"));
const SendGrid_1 = __importDefault(require("../services/SendGrid"));
const globals_1 = require("../globals");
const JWTAuthentication_1 = require("../services/JWTAuthentication");
const aggregations_1 = require("../aggregations");
const group_2 = __importDefault(require("./group"));
async function sendVerificationEmail(user) {
    const link = `https://www.imageus.io/verify/?id=${user.id}&verificationCode=${user.verificationCode}`;
    try {
        await SendGrid_1.default.sendMessage({
            to: user.email,
            from: 'no-reply@imageus.io',
            subject: 'Please Verify Your Account for ImageUs',
            text: `${user.firstName} ${user.lastName},
      Please verify your account by clicking the link below:
      ${link}`,
        });
    }
    catch (err) {
        throw new APIError_1.default('Failed to send email', 'An error occured while trying to send the email', 503);
    }
}
const User = {
    async register(req, res, next) {
        const { firstName, lastName, email, username, password, } = req.body;
        // Hash password
        const hashedPassword = await PasswordHasher_1.default.hash(password);
        // Verification code
        const verificationCode = uuid_1.v4();
        // create new user model with given request body
        const newUser = new user_1.default({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            verificationCode,
        });
        let user;
        try {
            user = await newUser.save();
        }
        catch (err) {
            // Duplicate Key Error
            if (err.code === 11000) {
                return next(new APIError_1.default('Username or email taken', 'Another username or email with the same name is already in use.', 409));
            }
            return next(new APIError_1.default());
        }
        // Strip sensitive info
        const reifiedUser = user.toJSON();
        delete reifiedUser.password;
        try {
            await sendVerificationEmail(user);
        }
        catch (err) {
            return next(err);
        }
        return res.status(201).send(reifiedUser);
    },
    login: async (req, res, next) => {
        let user;
        try {
            user = (await user_1.default.findOne({
                username: req.body.username,
            }, '+password')
                .exec());
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!user || !await PasswordHasher_1.default.validateHash(req.body.password, user.password)) {
            return next(new APIError_1.default('Incorrect Credentials', 'Cannot Log user in'));
        }
        if (!user.verified) {
            return next(new APIError_1.default('The user is not verified', 'The user has not verified their email yet', 401));
        }
        // Strip sensitive info
        const reifiedUser = user.toJSON();
        delete reifiedUser.password;
        reifiedUser.token = JWTAuthentication_1.createToken({ id: reifiedUser.id });
        return res.status(200).send(reifiedUser);
    },
    delete: async (req, res, next) => {
        const { id } = req.params;
        let user;
        try {
            user = await user_1.default.findById(id, '+password').exec();
            if (!user || !await PasswordHasher_1.default.validateHash(req.body.password, user.password)) {
                return next(new APIError_1.default('User not deleted', 'Either the user does not exist or the given password is incorrect', 403, `/users/${id}/`));
            }
            const owningGroups = await group_1.default.find({ creator: id }).exec();
            await Promise.all(owningGroups.map(async (x) => {
                req.params.id = x.id;
                req.body.user = id;
                await group_2.default.delete(true)(req, res, next);
            }));
            await image_1.default.deleteMany({ creator: id }).exec();
            await group_1.default.updateMany({ invitedUsers: { $in: [id] } }, { $pull: { invitedUsers: id } }).exec();
            await user.deleteOne();
        }
        catch (err) {
            next(new APIError_1.default());
        }
        return res.status(204).send();
    },
    fetch: (internalCall = false) => async (req, res, next) => {
        const { id } = req.params;
        let result;
        let imgURL;
        try {
            result = await user_1.default.findOne({ _id: id }).exec();
            if (!result) {
                return next(new APIError_1.default('Could not find User', `User with id ${id} could not be found.`, 404, `/users/${id}`));
            }
            imgURL = await S3_1.default.getPreSignedURL(`users/${result.id}/profile.jpeg`);
        }
        catch (err) {
            globals_1.logger.error(err);
            return next(new APIError_1.default());
        }
        const retVal = result.toJSON();
        retVal.imgURL = imgURL;
        if (!internalCall)
            return res.status(200).send(retVal);
        return retVal;
    },
    fetchGroups: async (req, res, next) => {
        const { id } = req.params;
        let groups;
        try {
            groups = await user_1.default.aggregate(aggregations_1.groupList(id)).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        await Promise.all(groups.map(async (group) => {
            const copy = group;
            copy.id = group._id;
            delete copy._id;
            if (!copy.thumbnail) {
                copy.thumbnail = null;
                return copy;
            }
            group.invitedUsers.map(user => {
                const userCopy = user;
                userCopy.id = user._id;
                delete userCopy._id;
                return userCopy;
            });
            copy.thumbnail.URL = await S3_1.default.getPreSignedURL(`groups/${copy.id}/${copy.thumbnail.fileName}`);
            return copy;
        }));
        return res.status(200).send(groups);
    },
    update: async (req, res, next) => {
        const { id } = req.params;
        let result;
        try {
            result = await user_1.default.findByIdAndUpdate(id, req.body, { new: true }).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!result) {
            return next(new APIError_1.default('User could not be found', `User with id ${id} was not found`, 404, `users/${id}`));
        }
        const updatedUser = await User.fetch(true)(req, res, next);
        return res.status(200).send(updatedUser);
    },
    uploadProfile: async (req, res, next) => {
        const { id } = req.params;
        // If there was no file attached we're done.
        if (!req.file) {
            return next(new APIError_1.default('Could not upload profile photo', 'The image payload is empty'));
        }
        const imageBuffer = req.file.buffer;
        const key = `users/${id}/profile.jpeg`;
        let imgURL;
        // Tack on image url
        try {
            await S3_1.default.uploadObject(key, imageBuffer);
            imgURL = await S3_1.default.getPreSignedURL(key);
        }
        catch (e) {
            next(new APIError_1.default());
        }
        return res.status(200).send({ imgURL });
    },
    verify: async (req, res, next) => {
        const { id } = req.params;
        const { verificationCode } = req.body;
        let result;
        try {
            result = await user_1.default.findOneAndUpdate({ _id: id, verificationCode }, { verified: true }).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!result) {
            return next(new APIError_1.default('User could not be found', `User with id ${id} was not found`, 404, `users/${id}/verify`));
        }
        return res.status(200).send(result.toJSON());
    },
    emailPasswordRecovery: async (req, res, next) => {
        const { email } = req.body;
        let result;
        const verificationCode = uuid_1.v4();
        try {
            result = await user_1.default.findOneAndUpdate({ email }, { verificationCode }).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!result) {
            return next(new APIError_1.default('User could not be found', `User with ${email} could not be found`, 404, `users/${email}/passwordRecovery`));
        }
        const link = `https://www.imageus.io/users/${result.id}/password-reset/?verificationCode=${verificationCode}`;
        SendGrid_1.default.sendMessage({
            to: result.email,
            from: 'no-reply@imageus.io',
            subject: 'Password Reset for ImageUs',
            text: 'Please visit the link below to reset your password, if you did not attempt to change your password you can'
                + ' ignore this email.:'
                + `${link}`,
        }).catch((err) => next(new APIError_1.default('Failed to send email', 'An error occured while trying to send the email', 503, err)));
        return res.status(200).send(result.toJSON());
    },
    resetPassword: async (req, res, next) => {
        const { userId, verificationCode, password } = req.body;
        try {
            const user = await user_1.default.findById(userId).exec();
            if (!user) {
                return next(new APIError_1.default('Password not reset', 'The given id does not represent a valid user', 404));
            }
            if (user.verificationCode !== verificationCode) {
                return next(new APIError_1.default('Password not reset', 'The verification code is invalid', 403));
            }
            const hashedPassword = await PasswordHasher_1.default.hash(password);
            await user.updateOne({ password: hashedPassword }).exec();
            return res.status(204).send();
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
    },
    async resendVerificationEmail(req, res, next) {
        const { email } = req.body;
        let user;
        try {
            user = await user_1.default.findOne({ email }).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!user) {
            return next(new APIError_1.default('User Could not be found', 'No such User exists', 404));
        }
        try {
            await sendVerificationEmail(user.toJSON());
        }
        catch (err) {
            return next(err);
        }
        return res.status(204).send();
    },
};
exports.default = User;
