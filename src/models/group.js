import mongoose from 'mongoose';
import User from './user';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [User],
  creator: { type: User, required: true },
  invites: [User],
});

groupSchema.methods.saveGroup = function saveGroup(callback) {
  return this.save(callback);
};

// TODO: invite code generation

const Group = mongoose.model(modelName, groupSchema);

export default Group;
