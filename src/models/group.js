import mongoose from 'mongoose';
import User from './user';

const modelName = 'Group';

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [User.schema],
  creator: { type: User.schema, required: true },
  invites: [User.schema],
});

const Group = mongoose.model(modelName, groupSchema);

export default Group;
