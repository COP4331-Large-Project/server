import {
  S3Client,
  ListBucketsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  Bucket,
  PutObjectCommandOutput,
  DeleteObjectOutput,
  GetObjectOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import assert from 'assert';
import { MetadataBearer } from '@aws-sdk/types/dist/types/response';

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

type Payload = {
  Bucket: string,
  Key?: string,
  File?: string,
}

/**
 * An object responsible for communicating with S3.
 */
const S3 = {
  /**
   * Fetches the all of the AWS S3 buckets.
   */
  getBuckets: async (): Promise<Bucket[] | undefined> => s3Client.send(new ListBucketsCommand({}))
    .then(result => result.Buckets),

  /**
   * Lists all objects within a given bucket.
   */
  listObjects: async (param: Payload = {
    Bucket: BUCKET,
  }): Promise<Record<string, unknown>[] | undefined> => s3Client.send(new ListObjectsCommand(param)).then(result => result.Contents as Record<string, unknown>[]),

  /**
   * Uploads a file to the bucket.
   */
  uploadObject: async (key: string, buffer: Buffer): Promise<PutObjectCommandOutput> => {
    assert(key);
    assert(buffer);

    return s3Client.send(new PutObjectCommand({
      Key: key,
      Bucket: BUCKET,
      Body: buffer,
    }));
  },

  /**
   * Delete an object with the given key and bucket.
   */
  deleteObject: async (key: string): Promise<DeleteObjectOutput & MetadataBearer> => {
    assert(key);
    return s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  },

  /**
   * Gets the object file for the given key.
   *
   */
  getObject: async (key: string): Promise<GetObjectOutput & MetadataBearer> => {
    assert(key);

    return s3Client.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  },

  /**
   * Perform a Get command for the specified Key and return
   * a pre-signed URL for the object
   */
  getPreSignedURL: async (key: string): Promise<string> => {
    assert(key);

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    return getSignedUrl(s3Client, getCommand);
  },

  destroy: (): void => s3Client.destroy(),
  getClient: (): S3Client => s3Client,
};

export default S3;
