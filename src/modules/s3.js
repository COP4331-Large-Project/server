import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { logger } from './globals.js';

const REGION = 'us-east-1';
dotenv.config();

// Pre-checks
const preCheck = () => {
  if (process.env.AWS_ACCESS_KEY_ID === undefined
    || process.env.AWS_SECRET_ACCESS_KEY === undefined) {
    logger.warn(
      `You haven't set the AWS_SECRET_ACCESS_KEY or
       the AWS_ACCESS_KEY_ID in your env file,
       skipping AWS S3 setup`,
    );
  }
};

const s3 = new S3Client({ region: REGION });
const listBuckets = async () => {
  preCheck();

  let data;
  try {
    data = await s3.send(new ListBucketsCommand({}));
    logger.info('Success', data.Buckets);
  } catch (err) {
    throw new Error(err);
  }
  return data;
};

export default listBuckets;
