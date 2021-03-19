import mongoose from 'mongoose';

const modelName = 'User';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  // "unique" may cause unexpected results if its value differs from the collection's index,
  // but is included for readability in the case that it doesnt
  username: { type: String, required: true, unique: true },
  // We set select to false here because we don't want to return the password in the response.
  password: { type: String, required: true, select: false },
});

const User = mongoose.model(modelName, userSchema);

export default User;
