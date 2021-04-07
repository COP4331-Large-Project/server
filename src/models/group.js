import mongoose from 'mongoose';
import User from './user';

const modelName = 'Group';

const imageSchema = new mongoose.Schema({
  // This field will always be empty in the database
  // It is just a field that will be used manually
  URL: String,
  caption: String,
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User },
  dateUploaded: { type: Date, required: true },
});

const groupSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  invitedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  images: [imageSchema],
  publicGroup: { type: Boolean, default: false },
  name: { type: String, required: true },
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

const Image = mongoose.model('Image', imageSchema);

export { Group, Image };
