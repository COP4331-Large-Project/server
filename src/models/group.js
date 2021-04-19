/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import User from './user';
import Image from './image';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  invitedUsers: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: User }], default: [] },
  publicGroup: { type: Boolean, default: false },
  name: { type: String, required: true, default: 'New Group' },
  thumbnail: { type: mongoose.Schema.Types.ObjectId, default: null },
});

const deepDelete = async function deepDelete() {
  await User.updateMany(
    { groups: { $in: this._id } },
    { $pull: { groups: this._id } },
  );
  await Image.deleteMany(
    { groupID: this._id },
  );
};

const populateFields = 'creator invitedUsers';

const autoPopulate = async function populator(doc) {
  if (!doc) {
    return;
  }
  await doc.populate(populateFields).execPopulate();
};

// Define schema hooks
groupSchema
  .pre('find', function populate() { this.populate(populateFields); })
  // uses regex to apply to all variants of "Document.delete-"
  .pre(/^delete/, { document: true }, deepDelete)
  .post(['findOne', 'save'], autoPopulate);

const Group = mongoose.model(modelName, groupSchema);

export default Group;
