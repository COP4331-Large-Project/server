import mongoose from 'mongoose';
import uuid from 'uuid';
import User from './user';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  invitedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  publicGroup: { type: Boolean, default: false },
});

groupSchema.statics.fieldsToPopulate = 'users creator invitedUsers';

const Group = mongoose.model(modelName, groupSchema);

export default Group;
