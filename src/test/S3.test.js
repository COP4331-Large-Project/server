import { expect } from 'chai';
import S3 from '../services/s3.js';
import { logger } from '../globals.js';

describe('#getBuckets', () => {
  it('should successfully retrieve buckets', async () => {
    // Fetch buckets
    const buckets = await S3.getBuckets();
    // Print Buckets
    logger.info('Bucket List:');
    buckets.forEach(bucket => logger.info(bucket.Name));
  });
});

describe('#listObjects', () => {
  it('should retrieve all the objects in the specified bucket', async () => {
    // Get objects
    const objects = await S3.listObjects() || [];
    // Print items
    logger.info('Objects:');
    objects.forEach(item => logger.info(item.Key));
  });
});

describe('Object Transfer', () => {
  // Setup: Upload file
  it('should upload file', async () => {
    await S3.uploadObject({
      Key: 'globals.js',
      Path: 'foo/',
      File: '../modules/globals.js',
    });
  });

  // Test if file was uploaded
  it('should get globals.js from foo/', async () => {
    // Then verify that the file exists.
    const object = await S3.getObject({
      Key: 'foo/globals.js',
    });
    expect(object).to.not.equal(undefined);
  });

  // Teardown: Delete uploaded file
  it('should delete file', async () => {
    await S3.deleteObject({ Key: 'foo/globals.js' });
  });
});
