export type User = {
    _id?: string,
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    verified: boolean,
    password?: string,
    verificationCode: string,
    groups: Array<Group>
    token?: string
    imgURL?: string
  }
  
export type Group = {
    inviteCode: string,
    creator: User,
    invitedUsers: User[],
    publicGroup: boolean,
    name: string,
    thumbnail: Image | null,
}
  
export type Image = {
    URL: string,
    caption: string,
    fileName: string,
    creator: User,
    dateUploaded: Date,
    groupID: string,
    key: string,
}