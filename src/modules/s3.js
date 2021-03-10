import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

const REGION = 'us-east-1';
dotenv.config();

/**
 * Verifies proper AWS SDK variables are set.
 *
 * @throws {Error} When env vars are not set.
 */
const preCheck = () => {
  if (process.env.AWS_ACCESS_KEY_ID === undefined
    || process.env.AWS_SECRET_ACCESS_KEY === undefined) {
    throw new Error(`
       You haven't set the AWS_SECRET_ACCESS_KEY or
       the AWS_ACCESS_KEY_ID in your env file,
       skipping AWS S3 setup...
    `);
  }
};

const s3 = new S3Client({ region: REGION });

/**
 * Fetches the all of the AWS S3 buckets.
 *
 * @returns {Promise<(ListBucketsOutput & MetadataBearer)>}
 */
const getBuckets = async () => {
  preCheck();

  return s3.send(new ListBucketsCommand({}));
};

export default getBuckets;
