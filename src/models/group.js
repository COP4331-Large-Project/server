import mongoose from 'mongoose';
import uuid from 'uuid';
import User from './user';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [User.schema],
  creator: { type: User.schema, required: true },
  invites: [User.schema],
});

groupSchema.methods.saveGroup = function saveGroup(callback) {
  this.populateInviteCode();
  return this.save(callback);
};

groupSchema.methods.populateInviteCode = function populateInviteCode() {
  this.inviteCode = uuid.v4();
};

// TODO: invite code generation

const Group = mongoose.model(modelName, groupSchema);

export default Group;
