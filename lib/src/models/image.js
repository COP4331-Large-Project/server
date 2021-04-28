"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./user"));
const imageSchema = new mongoose_1.default.Schema({
    // This field will always be empty in the database
    // It is just a field that will be used manually
    URL: String,
    caption: { type: String, default: '' },
    fileName: { type: String, required: true, unique: true },
    creator: { type: mongoose_1.default.Schema.Types.ObjectId, ref: user_1.default, required: true },
    dateUploaded: { type: Date, required: true, default: Date.now },
    groupID: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Group', required: true },
});
imageSchema.virtual('key').get(function getKey() {
    return `groups/${this.groupID}/${this.fileName}`;
});
const Image = mongoose_1.default.model('Image', imageSchema);
exports.default = Image;
