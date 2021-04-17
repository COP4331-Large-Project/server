import mongoose from 'mongoose';
import User from './user';
import S3 from '../services/S3';

const imageSchema = new mongoose.Schema({
  // This field will always be empty in the database
  // It is just a field that will be used manually
  URL: String,
  caption: { type: String, default: '' },
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  dateUploaded: { type: Date, required: true, default: new Date() },
  groupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
});

async function deletePhoto() {
  const key = `groups/${this.groupID}/${this.fileName}`;
  await S3.deleteObject(key);
}

imageSchema.pre(/^delete/, deletePhoto);

const Image = mongoose.model('Image', imageSchema);

export default Image;
