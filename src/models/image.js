import mongoose from 'mongoose';
import User from './user';

const modelName = 'Image';

const imageSchema = new mongoose.Schema({
  fileName: { type: String, required: true, unique: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: User },
  dateUploaded: { type: Date, required: true },
});

const populateFields = 'fileName dateUploaded';

const autoPopulate = async function populator(doc) {
  await doc.populate(populateFields).execPopulate();
};

imageSchema
  .pre('find', function populate() { this.populate(populateFields); })
  .post('findOne', autoPopulate)
  .post('save', autoPopulate);

const Image = mongoose.model(modelName, imageSchema);

export default Image;
