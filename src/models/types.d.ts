import { Document, Types } from 'mongoose'
import { ObjectId } from Types;

export type UserDocument = Document & {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password?: string,
  verified: boolean,
  verificationCode: string,
  groups: Array<ObjectId> | Array<GroupDocument>
  token?: string
  imgURL?: string
}

export type GroupDocument = Document & {
  inviteCode: string,
  creator: ObjectId | UserDocument,
  invitedUsers: (ObjectId | UserDocument)[],
  publicGroup: boolean,
  name: string,
  thumbnail: ObjectId | ImageDocument | null, 
}

export type ImageDocument = Document & {
  URL: string,
  caption: string,
  fileName: string,
  creator: ObjectId | UserDocument,
  dateUploaded: Date,
  groupID: ObjectId,
  key: string,
}