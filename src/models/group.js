import mongoose from 'mongoose';
import Image from './image';
import User from './user';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  invitedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: Image }],
  publicGroup: { type: Boolean, default: false },
  name: { type: String, required: true, unique: true },
});

const populateFields = 'users creator invitedUsers';

const autoPopulate = async function populator(doc) {
  await doc.populate(populateFields).execPopulate();
};

// Use hooks to auto-populate fields.
groupSchema
  .pre('find', function populate() { this.populate(populateFields); })
  .post('findOne', autoPopulate)
  .post('save', autoPopulate);

const Group = mongoose.model(modelName, groupSchema);

export default Group;
