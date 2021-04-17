import mongoose from 'mongoose';

const modelName = 'User';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  // "unique" may cause unexpected results if its value differs from the collection's index,
  // but is included for readability in the case that it doesnt
  username: { type: String, required: true, unique: true },
  // We set select to false here because we don't want to return the password in the response.
  password: { type: String, required: true, select: false },
  // We specify the reference by giving the model name rather than a refernce to the model
  // because it would create a circular dependency
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

const populateFields = 'groups';

const autoPopulate = async function populator(doc) {
  await doc.populate(populateFields).execPopulate();
};

userSchema.post('findOne', autoPopulate);

const User = mongoose.model(modelName, userSchema);

export default User;
