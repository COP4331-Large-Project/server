import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

const REGION = "us-east-1";
dotenv.config();

const s3 = new S3Client({ region: REGION });

const listBuckets = async () => {
    var data;
    try {
        data = await s3.send(new ListBucketsCommand({}));
        console.log("Success", data.Buckets);
    } catch (err) {
        console.log("Error", err);
    }
    return data
}
export default listBuckets;

