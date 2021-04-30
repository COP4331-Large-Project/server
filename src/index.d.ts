import { Response } from 'express';

/**
 * The model for a User in ImageUs
 */
export type User = {

  /**
   * The unique identifier of the user.
   */
  id?: string
  /**
   * The first name of the user.
   */
  firstName: string

  /**
   * The last name of the user.
   */
  lastName: string

  /**
   * The email of the user.
   */
  email: string

  /**
   * The username of the user.
   */
  username: string

  /**
   * The groups for which this user is a member of.
   */
  groups: Array<Group>

  /**
   * The password of the user's account.
   */
  password?: string

  /**
   * The profile image URL for the user.
   */
  imgURL?: string

  /**
   * The JSON web token for the user.
   */
  token?: string

  /**
   * The verification code for the user.
   */
  verificationCode?: string
};

export type Group = {
  inviteCode: string,
  creator: User,
  invitedUsers: User[],
  publicGroup: boolean,
  name: string
  thumbnail: string | null
};

export type Image = {
  URL: string,
  caption: string, 
  fileName: string,
  creator: User,
  dateUploaded: Date,
  groupID: string,
  key?: string,
}

export type ResponseReturn<T = undefined> = Promise<Response | void | T>;
