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
import { __dirname } from './globals.js';

const REGION = 'us-east-1';
dotenv.config();

// Validate whether env vars are set or not. (Fail-fast)
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error(`
       You haven't set the AWS_SECRET_ACCESS_KEY or
       the AWS_ACCESS_KEY_ID variable(s) in your env file.
    `);
}

const s3 = new S3Client({ region: REGION });

/**
 * Fetches the all of the AWS S3 buckets.
 *
 * @returns {Promise<Bucket[]>}
 */
const getBuckets = async () => s3.send(new ListBucketsCommand({}))
  .then(result => result.Buckets);

/**
 * @param param
 * @param {String} param.Bucket The name of the bucket
 * @returns {Promise<Object[]>}
 */
const listObjects = async (param = {
  Bucket: 'image-sharing-project',
}) => s3.send(new ListObjectsCommand(param)).then(result => result.Contents);

/**
 * @param payload
 * @param {String='image-sharing-project'} payload.Bucket The name of the bucket
 * @param {String} payload.Key The name of the file to be upload
 * @param {String} payload.Path The parent directory to put the file in
 * @param {String} payload.File The file to be uploaded
 * @returns {Promise<PutObjectCommandOutput>}
 */
const uploadObject = async (payload) => {
  assert(payload.Key !== undefined);
  assert(payload.File !== undefined);
  const contents = fs.readFileSync(path.resolve(__dirname, payload.File));
  const filePath = payload.Path || '';
  const input = {
    Bucket: payload.Bucket || 'image-sharing-project',
    Key: `${filePath}${payload.Key}`,
    Body: contents,
  };
  return s3.send(new PutObjectCommand(input));
};

/**
 * @param payload
 * @param {String='image-sharing-project'} payload.Bucket The name of the bucket.
 * @param {String} payload.Key The path of the file to delete.
 * @returns {Promise<DeleteObjectOutput & MetadataBearer>}
 */
const deleteObject = async (payload) => {
  assert(payload);
  assert(payload.Key !== undefined);
  const input = {
    Bucket: payload.Bucket || 'image-sharing-project',
    Key: payload.Key,
  };
  return s3.send(new DeleteObjectCommand(input));
};

/**
 * @param payload
 * @param {String} payload.Key The name of the file to fetch.
 * @param {String='image-sharing-project'} payload.Bucket The bucket to search in.
 * @returns {Promise<GetObjectOutput & MetadataBearer>}
 */
const getObject = async (payload) => {
  assert(payload);
  assert(payload.Key);
  const input = {
    Bucket: payload.Bucket || 'image-sharing-project',
    Key: payload.Key,
  };
  return s3.send(new GetObjectCommand(input));
};

export {
  getBuckets, listObjects, uploadObject, getObject, deleteObject,
};
