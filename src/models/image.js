import mongoose from 'mongoose';
import User from './user';

const imageSchema = new mongoose.Schema({
  // This field will always be empty in the database
  // It is just a field that will be used manually
  URL: String,
  caption: { type: String, default: '' },
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  dateUploaded: { type: Date, required: true, default: Date.now },
  groupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
});

imageSchema.virtual('key').get(function getKey() {
  return `groups/${this.groupID}/${this.fileName}`;
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
