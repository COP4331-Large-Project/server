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
const deepDelete = function deepDelete() {
    return __awaiter(this, void 0, void 0, function* () {
        yield user_1.default.updateMany({ groups: { $in: this._id } }, { $pull: { groups: this._id } });
        yield image_1.default.deleteMany({ groupID: this._id });
    });
};
const populateFields = 'creator invitedUsers';
const autoPopulate = function populator(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!doc) {
            return;
        }
        yield doc.populate(populateFields).execPopulate();
    });
};
// Define schema hooks
groupSchema
    .pre('find', function populate() { this.populate(populateFields); })
    // uses regex to apply to all variants of "Document.delete-"
    .pre(/^delete/, { document: true }, deepDelete)
    .post(['findOne', 'save'], autoPopulate)
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
