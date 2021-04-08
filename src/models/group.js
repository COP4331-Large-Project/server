/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import User from './user';

const modelName = 'Group';

const imageSchema = new mongoose.Schema({
  // This field will always be empty in the database
  // It is just a field that will be used manually
  URL: String,
  caption: { type: String, default: '' },
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  dateUploaded: { type: Date, required: true, default: new Date() },
});

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: User }], default: [] },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  invitedUsers: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: User }], default: [] },
  images: { type: [imageSchema], default: [] },
  publicGroup: { type: Boolean, default: false },
  name: { type: String, required: true, default: 'New Group' },
});

const deepDelete = async function deepDelete() {
  await User.updateMany(
    { groups: { $in: this._id } },
    { $pull: { groups: this._id } },
  );
};

const populateFields = 'users creator invitedUsers';

const autoPopulate = async function populator(doc) {
  await doc.populate(populateFields).execPopulate();
};

// Define schema hooks
groupSchema
  .pre('find', function populate() { this.populate(populateFields); })
  // uses regex to apply to all variants of "Document.delete-"
  .pre(/^delete/, { document: true }, deepDelete)
  .post(['findOne', 'save'], autoPopulate);

const Group = mongoose.model(modelName, groupSchema);

const Image = mongoose.model('Image', imageSchema);

export default Group;
export { Image };
