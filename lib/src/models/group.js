"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./user"));
const image_1 = __importDefault(require("./image"));
const modelName = 'Group';
const groupSchema = new mongoose_1.default.Schema({
    inviteCode: { type: String, required: true, unique: true },
    creator: { type: mongoose_1.default.Schema.Types.ObjectId, ref: user_1.default, required: true },
    invitedUsers: { type: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: user_1.default }], default: [] },
    publicGroup: { type: Boolean, default: false },
    name: { type: String, required: true, default: 'New Group' },
    thumbnail: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
});
const deepDelete = async function deepDelete() {
    await user_1.default.updateMany({ groups: { $in: this._id } }, { $pull: { groups: this._id } });
    await image_1.default.deleteMany({ groupID: this._id });
};
const populateFields = 'creator invitedUsers';
const autoPopulate = async function populator() {
    if (!this) {
        return;
    }
    await this.populate(populateFields).execPopulate();
};
// Define schema hooks
groupSchema
    .pre('find', function populate() { this.populate(populateFields); })
    // uses regex to apply to all variants of "Document.delete-"
    .pre(/^delete/, { document: true }, deepDelete)
    .pre(['save'], autoPopulate)
    .pre('aggregate', function populate() {
    this.lookup({
        from: 'users', localField: 'creator', foreignField: '_id', as: 'creator',
    });
    this.lookup({
        from: 'users', localField: 'invitedUsers', foreignField: '_id', as: 'invitedUsers',
    });
    this.lookup({
        from: 'images', localField: 'thumbnail', foreignField: '_id', as: 'thumbnail',
    });
});
const Group = mongoose_1.default.model(modelName, groupSchema);
exports.default = Group;
