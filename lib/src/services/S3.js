"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
const assert_1 = __importDefault(require("assert"));
const REGION = 'us-east-1';
const BUCKET = 'image-sharing-project';
dotenv_1.default.config();
// Validate whether env vars are set or not. (Fail-fast)
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error(`
       You haven't set the AWS_SECRET_ACCESS_KEY or
       the AWS_ACCESS_KEY_ID variable(s) in your env file.
    `);
}
// Establish S3 connection.
const s3Client = new client_s3_1.S3Client({ region: REGION });
/**
 * An object responsible for communicating with S3.
 */
const S3 = {
    /**
     * Fetches the all of the AWS S3 buckets.
     */
    getBuckets: async () => s3Client.send(new client_s3_1.ListBucketsCommand({}))
        .then(result => result.Buckets),
    /**
     * Lists all objects within a given bucket.
     */
    listObjects: async (param = {
        Bucket: BUCKET,
    }) => s3Client.send(new client_s3_1.ListObjectsCommand(param)).then(result => result.Contents),
    /**
     * Uploads a file to the bucket.
     */
    uploadObject: async (key, buffer) => {
        assert_1.default(key);
        assert_1.default(buffer);
        return s3Client.send(new client_s3_1.PutObjectCommand({
            Key: key,
            Bucket: BUCKET,
            Body: buffer,
        }));
    },
    /**
     * Delete an object with the given key and bucket.
     */
    deleteObject: async (key) => {
        assert_1.default(key);
        return s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }));
    },
    /**
     * Gets the object file for the given key.
     *
     */
    getObject: async (key) => {
        assert_1.default(key);
        return s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }));
    },
    /**
     * Perform a Get command for the specified Key and return
     * a pre-signed URL for the object
     */
    getPreSignedURL: async (key) => {
        assert_1.default(key);
        const getCommand = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });
        return s3_request_presigner_1.getSignedUrl(s3Client, getCommand);
    },
    destroy: () => s3Client.destroy(),
    getClient: () => s3Client,
};
exports.default = S3;
