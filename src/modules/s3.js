import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

const REGION = 'us-east-1';
dotenv.config();

// Validate whether env vars are set or not. (Fail-fast)
if (process.env.AWS_ACCESS_KEY_ID === undefined
  || process.env.AWS_SECRET_ACCESS_KEY === undefined) {
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

export default getBuckets;
