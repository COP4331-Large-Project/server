import {
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import S3 from './S3';

const s3Presigned = {

  payload: {
    Bucket: 'image-sharing-project',
    Key: undefined,
    Body: undefined,
  },

  /**
   * The returned URL gives the holder access to the object
   * @returns {Promise<String>} the url wrapped in the promise
   */
  uploadObject: async () => {
    assert(this.payload.Key !== undefined);
    assert(this.payload.Body !== undefined);
    const command = new PutObjectCommand(this.payload);
    const signedUrl = await getSignedUrl(S3.getClient(), command, {
      expiresIn: 3600,
    });
    this.clearPayload();
    return signedUrl;
  },

  /**
   * Defines the payload for upload
   * @param {*} params
   * @param {String} params.Path The parent directory to be made in the S3 bucket
   * @param {String} params.File The file on the local server to be read into the body
   * @param {String} params.Key The name of the file in the S3 bucket
   */
  definePayload: (params) => {
    const contents = fs.read(path.resolve(__dirname, params.File));
    this.payload.Body = contents;
    const filePath = params.Path || '';
    this.payload.Key = `${filePath}${params.Key}`;
    // TODO: key validation
  },

  clearPayload: () => {
    this.payload.Body = undefined;
    this.payload.Key = undefined;
  },
};

export default s3Presigned;
