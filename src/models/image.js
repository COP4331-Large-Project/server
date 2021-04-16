import mongoose from 'mongoose';
import Group from './group';
import User from './user';

const imageSchema = new mongoose.Schema({
  // This field will always be empty in the database
  // It is just a field that will be used manually
  URL: String,
  caption: { type: String, default: '' },
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  dateUploaded: { type: Date, required: true, default: new Date() },
  groupID: { type: mongoose.Schema.Types.ObjectId, ref: Group, required: true },
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
