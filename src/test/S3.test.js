import { expect } from 'chai';
import {
  deleteObject,
  getBuckets, getObject, listObjects, uploadObject,
} from '../modules/s3.js';
import { logger } from '../modules/globals.js';

describe('#getBuckets', () => {
  it('should successfully retrieve buckets', async () => {
    // Fetch buckets
    const buckets = await getBuckets();
    // Print Buckets
    logger.info('Bucket List:');
    buckets.forEach(bucket => logger.info(bucket.Name));
  });
});

describe('#listObjects', () => {
  it('should retrieve all the objects in the specified bucket', async () => {
    // Get objects
    const objects = await listObjects() || [];
    // Print items
    logger.info('Objects:');
    objects.forEach(item => logger.info(item.Key));
  });
});

describe('Object Transfer', () => {
  // Setup: Upload file
  it('should upload file', async () => {
    await uploadObject({
      Key: 'globals.js',
      Path: 'foo/',
      File: '../modules/globals.js',
    });
  });

  // Test if file was uploaded
  it('should get globals.js from foo/', async () => {
    // Then verify that the file exists.
    const object = await getObject({
      Key: 'foo/globals.js',
    });
    expect(object).to.not.equal(undefined);
  });

  // Teardown: Delete uploaded file
  it('should delete file', async () => {
    await deleteObject({ Key: 'foo/globals.js' });
  });
});
