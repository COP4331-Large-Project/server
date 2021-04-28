import mongoose from 'mongoose';
import { Aggregate } from 'mongoose';
import { UserDocument } from './types';

const modelName = 'User';

const userSchema = new mongoose.Schema<UserDocument>({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  // "unique" may cause unexpected results if its value differs from the collection's index,
  // but is included for readability in the case that it doesnt
  username: { type: String, required: true, unique: true },
  // We set select to false here because we don't want to return the password in the response.
  password: { type: String, required: true, select: false },
  verified: { type: Boolean, required: true, default: false },
  verificationCode: { type: String, required: true },
  // We specify the reference by giving the model name rather than a refernce to the model
  // because it would create a circular dependency
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

// const populateFields = 'groups';

// const autoPopulate = async function populator(doc) {
//   if (!doc) {
//     return;
//   }
//   await doc.populate(populateFields).execPopulate();
// };

// userSchema.post('findOne', autoPopulate);

userSchema.pre('aggregate', function populate(this: Aggregate<any>) {
  this.lookup({
    from: 'users', localField: 'creator', foreignField: '_id', as: 'creator',
  });
  this.lookup({
    from: 'users', localField: 'invitedUsers', foreignField: '_id', as: 'invitedUsers',
  });
  this.lookup({
    from: 'images', localField: 'thumbnail', foreignField: '_id', as: 'thumbnail',
  });
  this.unwind({ path: '$thumbnail', preserveNullAndEmptyArrays: true });
});

const User = mongoose.model<UserDocument>(modelName, userSchema);

export default User;
