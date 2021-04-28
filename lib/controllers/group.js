"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const aggregations_1 = require("../aggregations");
const group_1 = __importDefault(require("../models/group"));
const image_1 = __importDefault(require("../models/image"));
const user_1 = __importDefault(require("../models/user"));
const APIError_1 = __importDefault(require("../services/APIError"));
const S3_1 = __importDefault(require("../services/S3"));
const SendGrid_1 = __importDefault(require("../services/SendGrid"));
const Socket_1 = require("../services/Socket");
const { ObjectId } = mongoose_1.default.Types;
const Group = {
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // We will still use req.body.emails!
        const { creator, publicGroup, name, } = req.body;
        const newGroup = new group_1.default({
            creator, publicGroup, name,
        });
        try {
            newGroup.inviteCode = uuid_1.v4();
            const group = yield newGroup.save();
            req.params.id = group._id;
            // req.body.emails is used here!
            yield Group.inviteUsers(true)(req, res, next);
            // Add the creator to the group.
            yield group_1.default.findByIdAndUpdate(group, { $push: { users: creator } }).exec();
            // Push the ID on the user model.
            yield user_1.default.findByIdAndUpdate(creator, { $push: { groups: group._id } }).exec();
            return res.status(200).send(group.toJSON());
        }
        catch (err) {
            return next(new APIError_1.default('Group Creation Failed', 'Failed to create the group', 500, err));
        }
    }),
    join: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { inviteCode } = req.params;
        const userID = req.body.user;
        let group = (yield group_1.default
            .findOne({ inviteCode })
            .exec());
        const user = (yield user_1.default
            .findById(userID)
            .exec());
        // Check if group is found.
        if (group === null) {
            return next(new APIError_1.default('Group not found', 'Group does not exist', 404));
        }
        // Check if user was found.
        if (user === null) {
            return next(new APIError_1.default('User not found', 'User does not exist', 404));
        }
        if (user.groups.some((x) => x.equals(group._id))) {
            return next(new APIError_1.default('Failed to join group', 'User is already in this group', 418));
        }
        const authorizedUser = (group.invitedUsers).some(x => x.equals(user._id));
        if (authorizedUser || group.publicGroup) {
            yield user_1.default.findByIdAndUpdate(user, { $push: { groups: group._id } }).exec();
            // remove user from group's invited users array
            yield group.updateOne({ $pull: { invitedUsers: user._id } });
            // get updated group information
            group = (yield group_1.default
                .findOne({ inviteCode })
                .exec());
            // we pass 1 as the 'users joined' count just for continuity and future-proofing
            Socket_1.getIo().to(group.id).emit('user joined', user.username, group.id);
            req.params.id = group.id;
            const result = yield Group.fetch(true)(req, res, next);
            return res.status(200).send(result);
        }
        return next(new APIError_1.default('Cannot join Group.', 'User does not have permission to join this group.', 403, `/groups/join/${inviteCode}`));
    }),
    fetch: (internalCall = false) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        let result;
        try {
            [result] = yield group_1.default.aggregate(aggregations_1.singleGroup(id)).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!result) {
            return next(new APIError_1.default('Could not find Group', `Group with id ${id} could not be found.`, 404, `/groups/${id}`));
        }
        result.invitedUsers.map(user => {
            const userCopy = user;
            userCopy.id = user._id;
            delete userCopy._id;
            return userCopy;
        });
        result.id = result._id;
        delete result._id;
        result.thumbnail = (_a = yield Group.thumbnail(true)(req, res, next)) !== null && _a !== void 0 ? _a : null;
        if (!internalCall)
            return res.status(200).send(result);
        return result;
    }),
    delete: (internalCall = false) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const user = ObjectId(req.body.user);
        const group = yield group_1.default.findById(id).exec();
        if (!group) {
            return next(new APIError_1.default('Group could not be deleted', 'No such Group exists', 404, `/groups/${id}/`));
        }
        // if the group creator is not truthy, they probably dont exist anymore
        // just let anyone delete the group at that point
        const hasCreator = group.creator === 'undefined' || group.creator === null || !Object.prototype.hasOwnProperty.call(group, 'creator');
        if (hasCreator && !group.creator._id.equals(user._id)) {
            return next(new APIError_1.default('Group could not be deleted', 'User is not permitted', 403, `/groups/${id}/`));
        }
        yield group.deleteOne();
        Socket_1.getIo().in(`${group.id}`).emit('group deleted', group.id);
        if (!internalCall)
            return res.status(204).send();
    }),
    upload: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { userId, caption } = req.body;
        if (!req.file) {
            return next(new APIError_1.default('Group Could not upload file', 'No file provided', 415, `/groups/${id}`));
        }
        if (!ObjectId.isValid(id)) {
            return next(new APIError_1.default('Group photo could not be uploaded.', 'Bad group id given', 404, `/groups/${id}/uploadImage`));
        }
        const groupID = ObjectId(id);
        const group = yield group_1.default.findById(groupID);
        if (!group) {
            return next(new APIError_1.default('Group photo could not be uploaded.', 'No such Group exists', 404, `/groups/${id}/uploadImage`));
        }
        const validFileTypes = ['image/jpeg', 'image/gif', 'image/jpg', 'image/png'];
        if (!validFileTypes.some((x) => x === req.file.mimetype)) {
            return next(new APIError_1.default('Media not uploaded', 'The uploaded media is not of a supported type', 415));
        }
        const imageBuffer = req.file.buffer;
        const fileName = `${uuid_1.v4()}.jpeg`;
        const key = `groups/${id}/${fileName}`;
        try {
            yield S3_1.default.uploadObject(key, imageBuffer);
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        const image = new image_1.default({
            fileName,
            caption,
            creator: userId,
            groupID,
        });
        try {
            yield group.updateOne({ thumbnail: image._id }).exec();
            yield image.save();
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        image.URL = yield S3_1.default.getPreSignedURL(key);
        const user = yield user_1.default.findById(userId).exec();
        Socket_1.getIo().in(`${group.id}`).emit('image uploaded', image, user.username, group.id);
        return res.status(200).send(image);
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            yield group_1.default.findByIdAndUpdate(id, req.body);
        }
        catch (err) {
            if (err.code === 11000) {
                return next(new APIError_1.default('Name is taken', 'The name you provided is already taken.', 409));
            }
            return next(new APIError_1.default());
        }
        return res.status(204).send();
    }),
    thumbnail: (internalCall = false) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        let group;
        let thumbnailDoc;
        try {
            group = yield group_1.default.findOne({ _id: id }).exec();
        }
        catch (err) {
            return next(new APIError_1.default());
        }
        if (!group) {
            return next(new APIError_1.default('Could not find Group', `Group with id ${id} could not be found.`, 404, `/groups/${id}`));
        }
        if (!group.thumbnail) {
            return next(new APIError_1.default('No image to show', `Group with id ${id} does not have any images.`, 404, `/groups/${id}`));
        }
        // eslint-disable-next-line max-len
        try {
            thumbnailDoc = yield image_1.default.findById(group.thumbnail);
            if (!thumbnailDoc) {
                if (!internalCall)
                    return res.status(200).send();
                return undefined;
            }
            thumbnailDoc.URL = yield S3_1.default.getPreSignedURL(thumbnailDoc.key);
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        if (!internalCall)
            return res.status(200).send(thumbnailDoc);
        return thumbnailDoc;
    }),
    getImages: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const groupID = ObjectId(id);
        let images;
        try {
            const imageRefs = yield image_1.default.find({ groupID });
            if (!imageRefs)
                return res.status(201).send({ images });
            images = yield Promise.all(imageRefs.map((x) => __awaiter(void 0, void 0, void 0, function* () {
                // eslint-disable-next-line no-param-reassign
                const image = x;
                image.URL = yield S3_1.default.getPreSignedURL(image.key);
                return image;
            })));
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        return res.status(201).send({ images });
    }),
    deleteImages: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // array of image ids
        let { images } = req.body;
        const { id } = req.params;
        let group;
        try {
            group = yield group_1.default.findById(id).exec();
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        if (!group) {
            return next(new APIError_1.default('Could not find Group', `Group with id ${id} could not be found.`, 404, `/groups/${id}`));
        }
        try {
            const imageRefs = yield image_1.default.find({
                $and: [
                    { _id: { $in: images } },
                    { groupID: id }
                ],
            }).exec();
            yield Promise.all(imageRefs.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                yield S3_1.default.deleteObject(image.key);
                yield image.deleteOne();
            })));
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        images = images.map((x) => ObjectId(x));
        const thumbnailDeleted = images.filter((x) => x.equals(group.thumbnail));
        if (thumbnailDeleted.length === 1) {
            const groupImages = yield image_1.default.find({ groupID: id }).exec();
            if (groupImages.length !== 0) {
                groupImages.sort((a, b) => b.dateUploaded - a.dateUploaded);
                yield group.updateOne({ thumbnail: groupImages[0] }).exec();
            }
            else {
                yield group.updateOne({ thumbnail: null }).exec();
            }
        }
        res.status(200).send();
    }),
    // internalCall is used for the register endpoint so that a http response isnt sent
    inviteUsers: (internalCall = false) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { emails } = req.body;
        const group = (yield group_1.default
            .findById(id)
            .exec());
        // Check if group is found.
        if (group === null) {
            return next(new APIError_1.default('Group not found', 'Group does not exist', 404));
        }
        // get object ID of invited users based on given email
        // if the email wasnt found, return null
        let invitedUser = yield Promise.all(emails.map((x) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findOne({ email: x }).exec();
            if (!user)
                return null;
            return user;
        })));
        // if null, the user wasnt found, so just forget about them
        invitedUser = invitedUser.filter((x) => x !== null);
        yield group.updateOne({ $push: { invitedUsers: invitedUser } });
        invitedUser.forEach((user) => {
            const link = `https://www.imageus.io/invite/${group.inviteCode}?userId=${user.id}&groupId=${group.id}`;
            SendGrid_1.default.sendMessage({
                to: user.email,
                from: 'no-reply@imageus.io',
                subject: `You have been invited to join ${group.name}`,
                text: `To accept your invite to the group, click the link below:
      ${link}`,
            }).catch((err) => next(new APIError_1.default('Failed to send email', 'An error occurred while trying to send the email', 503, err)));
        });
        if (!internalCall)
            return res.status(204).send();
    }),
    removeUser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        let { user } = req.body;
        const group = (yield group_1.default
            .findById(id)
            .exec());
        // Check if group is found.
        if (group === null) {
            return next(new APIError_1.default('User not removed from group', 'Group does not exist', 404));
        }
        user = yield user_1.default.findById(user).exec();
        if (!user) {
            return next(new APIError_1.default('User not removed from group', 'User does not exist', 404));
        }
        // remove user refernces from this group
        yield group.updateOne({ $pull: { invitedUsers: user._id } }).exec();
        // remove reference to this group from the user
        yield user.updateOne({ $pull: { groups: group._id } }).exec();
        Socket_1.getIo().to(group.id).emit('user removed', user.username, group.id);
        return res.status(204).send();
    }),
};
exports.default = Group;
