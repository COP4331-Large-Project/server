import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { logger } from './globals.js';

const REGION = 'us-east-1';
dotenv.config();

const s3 = new S3Client({ region: REGION });

const listBuckets = async () => {
  let data;
  try {
    data = await s3.send(new ListBucketsCommand({}));
    logger.log('Success', data.Buckets);
  } catch (err) {
    logger.log('Error', err);
  }
  return data;
};

export default listBuckets;
