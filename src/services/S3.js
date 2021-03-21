import {
  S3Client,
  ListBucketsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import assert from 'assert';

const REGION = 'us-east-1';
const BUCKET = 'image-sharing-project';
dotenv.config();

// Validate whether env vars are set or not. (Fail-fast)
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error(`
       You haven't set the AWS_SECRET_ACCESS_KEY or
       the AWS_ACCESS_KEY_ID variable(s) in your env file.
    `);
}

// Establish S3 connection.
const s3Client = new S3Client({ region: REGION });

/**
 * @typedef Payload
 * @property {String} Bucket The bucket to use.
 * @property {String} Key The Key of the file within the bucket.
 * @property {String} File The local file to use
 */

/**
 * An object responsible for communicating with S3.
 */
const S3 = {
  /**
   * Fetches the all of the AWS S3 buckets.
   *
   * @returns {Promise<Bucket[]>}
   */
  getBuckets: async () => s3Client.send(new ListBucketsCommand({}))
    .then(result => result.Buckets),

  /**
   * Lists all objects within a given bucket.
   *
   * @param {Payload} param
   * @returns {Promise<Object[]>}
   */
  listObjects: async (param = {
    Bucket: BUCKET,
  }) => s3Client.send(new ListObjectsCommand(param)).then(result => result.Contents),

  /**
   * Uploads a file to the bucket.
   *
   * @param {Payload} payload
   * @returns {Promise<PutObjectCommandOutput>}
   */
  uploadObject: async (payload) => {
    assert(payload);
    assert(payload.Key);
    assert(payload.Bucket);
    assert(payload.Body);

    return s3Client.send(new PutObjectCommand(payload));
  },

  /**
   * Delete an object with the given key and bucket.
   *
   * @param {Payload} payload
   * @returns {Promise<DeleteObjectOutput & MetadataBearer>}
   */
  deleteObject: async (payload) => {
    assert(payload);
    assert(payload.Key !== undefined);
    const input = {
      Bucket: payload.Bucket || BUCKET,
      Key: payload.Key,
    };
    return s3Client.send(new DeleteObjectCommand(input));
  },

  /**
   * Gets the object file for the given key.
   *
   * @param {Payload} payload
   * @returns {Promise<GetObjectOutput & MetadataBearer>}
   */
  getObject: async (payload) => {
    assert(payload);
    assert(payload.Key);
    const input = {
      Bucket: payload.Bucket || BUCKET,
      Key: payload.Key,
    };
    return s3Client.send(new GetObjectCommand(input));
  },

  /**
   * Perform a Get command for the specified Key and return
   * a pre-signed URL for the object
   *
   * @param {Payload} payload
   * @returns {Promise<string>}
   */
  getPreSignedURL: async (payload) => {
    assert(payload);
    assert(payload.Key);
    assert(payload.Bucket);

    const getCommand = new GetObjectCommand(payload);
    return getSignedUrl(s3Client, getCommand);
  },

  destroy: () => s3Client.destroy(),
  getClient: () => s3Client,
};

export default S3;
