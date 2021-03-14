import mongoose from 'mongoose';

const modelName = 'User';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  // "unique" may cause unexpected results if its value differs from the collection's index,
  // but is included for readability in the case that it doesnt
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.methods.saveUser = function saveUser(callback) {
  return this.save(callback);
};

userSchema.methods.loginUser = function loginUser(callback) {
  return this.findOne(callback);
};

const User = mongoose.model(modelName, userSchema);

export default User;
