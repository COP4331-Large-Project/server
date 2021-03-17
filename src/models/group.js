import mongoose from 'mongoose';
import uuid from 'uuid';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [mongoose.Schema.Types.ObjectId],
  creator: { type: mongoose.Schema.Types.ObjectId, required: true },
  invites: [mongoose.Schema.Types.ObjectId],
  publicGroup: Boolean,
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
