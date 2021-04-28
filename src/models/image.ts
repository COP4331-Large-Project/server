import mongoose from 'mongoose';
import { ImageDocument } from './types';
import User from './user';

const imageSchema = new mongoose.Schema<ImageDocument>({
  // This field will always be empty in the database
  // It is just a field that will be used manually
  URL: String,
  caption: { type: String, default: '' },
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  dateUploaded: { type: Date, required: true, default: Date.now },
  groupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
});

imageSchema.virtual('key').get(function getKey(this: ImageDocument) {
  return `groups/${this.groupID}/${this.fileName}`;
});

const Image = mongoose.model<ImageDocument>('Image', imageSchema);

export default Image;
