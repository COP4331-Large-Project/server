import mongoose from 'mongoose';
import User from './user';

const modelName = 'Image';

const imageSchema = new mongoose.Schema({
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User },
  dateUploaded: { type: Date, required: true },
});

const Image = mongoose.model(modelName, imageSchema);

export default Image;
