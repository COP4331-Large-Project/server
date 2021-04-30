import { Document, Types } from 'mongoose'

export type UserDocument = Document & {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password?: string,
  verified: boolean,
  verificationCode: string,
  groups: Array<Types.ObjectId> | Array<GroupDocument>
  token?: string
  imgURL?: string
}

export type GroupDocument = Document & {
  inviteCode: string,
  creator: ObjectId | UserDocument,
  invitedUsers: (ObjectId | UserDocument)[],
  publicGroup: boolean,
  name: string,
  thumbnail: Types.ObjectId | ImageDocument | null, 
}

export type ImageDocument = Document & {
  URL: string,
  caption: string,
  fileName: string,
  creator: Types.ObjectId | UserDocument,
  dateUploaded: Date,
  groupID: Types.ObjectId,
  key: string,
}