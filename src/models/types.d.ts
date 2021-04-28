import { Document, Types } from 'mongoose'

export type UserDocument = Document & {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  verified: boolean,
  verificationCode: string,
  groups: Array<ObjectId> | Array<GroupDocument>
}

export type GroupDocument = Document & {
  inviteCode: string,
  creator: UserDocument,
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