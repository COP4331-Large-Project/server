import mongoose from 'mongoose';

const modelName = 'User';

const userSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  // "unique" may cause unexpected results if its value differs from the collection's index,
  // but is included for readability in the case that it doesnt
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
});

userSchema.methods.saveUser = function saveUser(callback) {
  return this.save(callback);
};

const Model = mongoose.model(modelName, userSchema);

export default Model;
