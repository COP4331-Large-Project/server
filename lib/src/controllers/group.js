"use strict";
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
    register: async (req, res, next) => {
        // We will still use req.body.emails!
        const { creator, publicGroup, name, } = req.body;
        const newGroup = new group_1.default({
            creator, publicGroup, name,
        });
        try {
            newGroup.inviteCode = uuid_1.v4();
            const group = await newGroup.save();
            req.params.id = group._id;
            // req.body.emails is used here!
            await Group.inviteUsers(true)(req, res, next);
            // Add the creator to the group.
            await group_1.default.findByIdAndUpdate(group, { $push: { users: creator } }).exec();
            // Push the ID on the user model.
            await user_1.default.findByIdAndUpdate(creator, { $push: { groups: group._id } }).exec();
            return res.status(200).send(group.toJSON());
        }
        catch (err) {
            return next(new APIError_1.default('Group Creation Failed', 'Failed to create the group', 500, err));
        }
    },
    join: async (req, res, next) => {
        const { inviteCode } = req.params;
        const userID = req.body.user;
        let group = (await group_1.default
            .findOne({ inviteCode })
            .exec());
        const user = (await user_1.default
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
        var arr = [11, 89, 23, 7, 98];
        arr.map(e => e);
        function isBiggerThan10(element) {
            return element > 10;
        }
        [2, 5, 8, 1, 4].some(isBiggerThan10);
        if (user.groups.some(x => x.equals(group._id))) {
            return next(new APIError_1.default('Failed to join group', 'User is already in this group', 418));
        }
        const authorizedUser = group.invitedUsers.some(x => x.equals(user._id));
        if (authorizedUser || group.publicGroup) {
            await user_1.default.findByIdAndUpdate(user, { $push: { groups: group._id } }).exec();
            // remove user from group's invited users array
            await group.updateOne({ $pull: { invitedUsers: user._id } });
            // get updated group information
            group = (await group_1.default
                .findOne({ inviteCode })
                .exec());
            // we pass 1 as the 'users joined' count just for continuity and future-proofing
            Socket_1.getIo().to(group.id).emit('user joined', user.username, group.id);
            req.params.id = group.id;
            const result = await Group.fetch(true)(req, res, next);
            return res.status(200).send(result);
        }
        return next(new APIError_1.default('Cannot join Group.', 'User does not have permission to join this group.', 403, `/groups/join/${inviteCode}`));
    },
    fetch: (internalCall = false) => async (req, res, next) => {
        const { id } = req.params;
        let result;
        try {
            [result] = await group_1.default.aggregate(aggregations_1.singleGroup(id)).exec();
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
        result.thumbnail = await Group.thumbnail(true)(req, res, next) ?? null;
        if (!internalCall)
            return res.status(200).send(result);
        return result;
    },
    delete: (internalCall = false) => async (req, res, next) => {
        const { id } = req.params;
        const user = ObjectId(req.body.user);
        const group = await group_1.default.findById(id).exec();
        if (!group) {
            return next(new APIError_1.default('Group could not be deleted', 'No such Group exists', 404, `/groups/${id}/`));
        }
        // if the group creator is not truthy, they probably dont exist anymore
        // just let anyone delete the group at that point
        const hasCreator = group.creator === undefined || group.creator === null || !Object.prototype.hasOwnProperty.call(group, 'creator');
        if (hasCreator && !group.creator._id.equals(user)) {
            return next(new APIError_1.default('Group could not be deleted', 'User is not permitted', 403, `/groups/${id}/`));
        }
        await group.deleteOne();
        Socket_1.getIo().in(`${group.id}`).emit('group deleted', group.id);
        if (!internalCall)
            return res.status(204).send();
    },
    upload: async (req, res, next) => {
        const { id } = req.params;
        const { userId, caption } = req.body;
        if (!req.file) {
            return next(new APIError_1.default('Group Could not upload file', 'No file provided', 415, `/groups/${id}`));
        }
        if (!ObjectId.isValid(id)) {
            return next(new APIError_1.default('Group photo could not be uploaded.', 'Bad group id given', 404, `/groups/${id}/uploadImage`));
        }
        const groupID = ObjectId(id);
        const group = await group_1.default.findById(groupID);
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
            await S3_1.default.uploadObject(key, imageBuffer);
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
            await group.updateOne({ thumbnail: image._id }).exec();
            await image.save();
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        image.URL = await S3_1.default.getPreSignedURL(key);
        const user = await user_1.default.findById(userId).exec();
        if (user === null) {
            return next(new APIError_1.default());
        }
        Socket_1.getIo().in(`${group.id}`).emit('image uploaded', image, user.username, group.id);
        return res.status(200).send(image);
    },
    update: async (req, res, next) => {
        const { id } = req.params;
        try {
            await group_1.default.findByIdAndUpdate(id, req.body);
        }
        catch (err) {
            if (err.code === 11000) {
                return next(new APIError_1.default('Name is taken', 'The name you provided is already taken.', 409));
            }
            return next(new APIError_1.default());
        }
        return res.status(204).send();
    },
    thumbnail: (internalCall = false) => async (req, res, next) => {
        const { id } = req.params;
        let group;
        let thumbnailDoc;
        try {
            group = await group_1.default.findOne({ _id: id }).exec();
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
        try {
            thumbnailDoc = await image_1.default.findById(group.thumbnail);
            if (!thumbnailDoc) {
                if (!internalCall)
                    return res.status(200).send();
                return undefined;
            }
            thumbnailDoc.URL = await S3_1.default.getPreSignedURL(thumbnailDoc.key);
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        if (!internalCall)
            return res.status(200).send(thumbnailDoc);
        return thumbnailDoc;
    },
    getImages: async (req, res, next) => {
        const { id } = req.params;
        const groupID = ObjectId(id);
        let images;
        try {
            const imageRefs = await image_1.default.find({ groupID });
            if (!imageRefs)
                return res.status(201).send({ images });
            images = await Promise.all(imageRefs.map(async (x) => {
                // eslint-disable-next-line no-param-reassign
                const image = x;
                image.URL = await S3_1.default.getPreSignedURL(image.key);
                return image;
            }));
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        return res.status(201).send({ images });
    },
    deleteImages: async (req, res, next) => {
        // array of image ids
        let { images } = req.body;
        const id = mongoose_1.default.Types.ObjectId(req.params.id);
        let group;
        try {
            group = await group_1.default.findById(id).exec();
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        if (!group) {
            return next(new APIError_1.default('Could not find Group', `Group with id ${id} could not be found.`, 404, `/groups/${id}`));
        }
        try {
            const imageRefs = await image_1.default.find({
                $and: [
                    { _id: { $in: images } },
                    { groupID: id }
                ],
            }).exec();
            await Promise.all(imageRefs.map(async (image) => {
                await S3_1.default.deleteObject(image.key);
                await image.deleteOne();
            }));
        }
        catch (err) {
            return next(new APIError_1.default(undefined, undefined, undefined, err));
        }
        const imageIDs = images.map((x) => x.id);
        const thumbnailDeleted = imageIDs.filter((x) => x.equals(group.thumbnail));
        if (thumbnailDeleted.length === 1) {
            const groupImages = await image_1.default.find({ groupID: id }).exec();
            if (groupImages.length !== 0) {
                groupImages.sort((a, b) => b.dateUploaded.getTime() - a.dateUploaded.getTime());
                await group.updateOne({ thumbnail: groupImages[0] }).exec();
            }
            else {
                await group.updateOne({ thumbnail: null }).exec();
            }
        }
        res.status(200).send();
    },
    // internalCall is used for the register endpoint so that a http response isnt sent
    inviteUsers: (internalCall = false) => async (req, res, next) => {
        const { id } = req.params;
        const { emails } = req.body;
        const group = (await group_1.default
            .findById(id)
            .exec());
        // Check if group is found.
        if (group === null) {
            return next(new APIError_1.default('Group not found', 'Group does not exist', 404));
        }
        // get object ID of invited users based on given email
        // if the email wasnt found, return null
        let invitedUsers = await Promise.all(emails.map(async (x) => {
            const user = await user_1.default.findOne({ email: x }).exec();
            if (!user)
                return null;
            return user;
        }));
        // if null, the user wasnt found, so just forget about them
        const filteredUsers = invitedUsers.filter((x) => x !== null);
        await group.updateOne({ $push: { invitedUsers: filteredUsers } });
        filteredUsers.forEach((user) => {
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
    },
    removeUser: async (req, res, next) => {
        const { id } = req.params;
        let { user } = req.body;
        const group = (await group_1.default
            .findById(id)
            .exec());
        // Check if group is found.
        if (group === null) {
            return next(new APIError_1.default('User not removed from group', 'Group does not exist', 404));
        }
        user = await user_1.default.findById(user).exec();
        if (!user) {
            return next(new APIError_1.default('User not removed from group', 'User does not exist', 404));
        }
        // remove user refernces from this group
        await group.updateOne({ $pull: { invitedUsers: user._id } }).exec();
        // remove reference to this group from the user
        await user.updateOne({ $pull: { groups: group._id } }).exec();
        Socket_1.getIo().to(group.id).emit('user removed', user.username, group.id);
        return res.status(204).send();
    },
};
exports.default = Group;
