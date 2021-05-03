/**
 * The model for a the user that is part of the service.
 */
export type User = {
    _id?: string,

    /**
     * The unique idenfier of the user.
     */
    id: string,

    /**
     * The first name of the user.
     */
    firstName: string,

    /**
     * The last name of the user.
     */
    lastName: string,

    /**
     * The email of the user.
     */
    email: string,

    /**
     * The user's username.
     */
    username: string,

    /**
     * Whether the user has verified their account or not.
     */
    verified: boolean,

    /**
     * The password for the user account.
     */
    password?: string,

    /**
     * The code used to verify this user.
     */
    verificationCode: string,

    /**
     * The groups this user is a member of.
     */
    groups: Array<Group>

    /**
     * The JWT token for the user's authentication.
     */
    token?: string

    /**
     * The url to the user's profile picture.
     */
    imgURL?: string
}

/**
 * Represents a collection of users and images.
 */
export type Group = {
    /**
     * The invite code to become a member of this group.
     */
    inviteCode: string,

    /**
     * The original user whom created the group.
     */
    creator: User,

    /**
     * The list of users who are invited to this group.
     */
    invitedUsers: User[],

    /**
     * Indicates whether this group is open for anyone to join
     * or restricted to invited users only.
     */
    publicGroup: boolean,

    /**
     * The name of the group.
     */
    name: string,

    /**
     * The URL of the thumbnail for the group.
     */
    thumbnail: Image | null,
}

/**
 * Represents the image that is within a given group.
 */
export type Image = {
    /**
     * The URL of the image.
     */
    URL: string,

    /**
     * The caption of the image.
     */
    caption: string,

    /**
     * The filename of the image.
     */
    fileName: string,

    /**
     * The user who uploaded this image.
     */
    creator: User,

    /**
     * The date of when the image was uploaded.
     */
    dateUploaded: Date,

    /**
     * The ID of the group this image belongs to.
     */
    groupID: string,

    /**
     * The object key for this image stored in AWS S3.
     */
    key: string,
}