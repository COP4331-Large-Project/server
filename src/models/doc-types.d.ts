import { Document, PopulatedDoc, Types } from 'mongoose'
import { User, Group, Image } from '../types'

export type UserDocument = Document & User & {
  password: string,
  groups: PopulatedDoc<GroupDocument>[]
}

export type GroupDocument = Document & Group & {
  creator: PopulatedDoc<UserDocument>,
  invitedUsers: PopulatedDoc<UserDocument>[],
  thumbnail: PopulatedDoc<ImageDocument> | null, 
}

export type ImageDocument = Document & Image & {
  creator: PopulatedDoc<UserDocument>,
  groupID: Types.ObjectId,
}