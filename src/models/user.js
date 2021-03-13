import mongoose from 'mongoose';

const modelName = 'User';

const userSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  Username: { type: String, required: true },
  Password: { type: String, required: true },
});

userSchema.methods.saveUser = function saveUser(callback) {
  return this.save(callback);
};

const Model = mongoose.model(modelName, userSchema);

export default Model;
