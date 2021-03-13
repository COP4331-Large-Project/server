import mongoose from 'mongoose';

const modelName = 'User';

const userSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  Username: { type: String, required: true },
  Password: String,
});

userSchema.methods.saveUser = function (callback) {
  return this.save(callback);
};

const Model = mongoose.model(modelName, userSchema);

export default Model;
