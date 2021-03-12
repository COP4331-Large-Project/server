import {
  S3Client,
  ListBucketsCommand,
  ListObjectsCommand,
  PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../globals.js';

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
   * @param param
   * @param {String} param.Bucket The name of the bucket
   * @returns {Promise<Object[]>}
   */
  listObjects: async (param = {
    Bucket: BUCKET,
  }) => s3Client.send(new ListObjectsCommand(param)).then(result => result.Contents),

  /**
   * @param payload
   * @param {String='image-sharing-project'} payload.Bucket The name of the bucket
   * @param {String} payload.Key The name of the file to be upload
   * @param {String} payload.Path The parent directory to put the file in
   * @param {String} payload.File The file to be uploaded
   * @returns {Promise<PutObjectCommandOutput>}
   */
  uploadObject: async (payload) => {
    assert(payload.Key !== undefined);
    assert(payload.File !== undefined);
    const contents = fs.readFileSync(path.resolve(__dirname, payload.File));
    const filePath = payload.Path || '';
    const input = {
      Bucket: payload.Bucket || BUCKET,
      Key: `${filePath}${payload.Key}`,
      Body: contents,
    };
    return s3Client.send(new PutObjectCommand(input));
  },

  /**
   * @param payload
   * @param {String='image-sharing-project'} payload.Bucket The name of the bucket.
   * @param {String} payload.Key The path of the file to delete.
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
   * @param payload
   * @param {String} payload.Key The name of the file to fetch.
   * @param {String='image-sharing-project'} payload.Bucket The bucket to search in.
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
};

export default S3;
