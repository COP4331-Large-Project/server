import mongoose from 'mongoose';
import uuid from 'uuid';
import User from './user';

const modelName = 'Group';
const popAll = 'users creator invitedUsers';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  invitedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  public: { type: Boolean, default: false },
});

groupSchema.methods.saveGroup = function saveGroup(callback) {
  this.inviteCode = uuid.v4();
  return this.save(callback);
};

const Group = mongoose.model(modelName, groupSchema);

export { popAll };
export default Group;
