import { Document, Types } from 'mongoose'
import { User, Group, Image } from '../types'

export type UserDocument = Document & User & {
  password: string,
  groups: Array<Types.ObjectId> | Array<GroupDocument>
}

export type GroupDocument = Document & Group & {
  creator: ObjectId | UserDocument,
  invitedUsers: (ObjectId | UserDocument)[],
  thumbnail: Types.ObjectId | ImageDocument | null, 
}

export type ImageDocument = Document & Image & {
  creator: Types.ObjectId | UserDocument,
  groupID: Types.ObjectId,
}