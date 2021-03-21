import path from 'path';
import fs from 'fs';
import S3 from '../services/S3';
import { logger } from '../globals';

afterAll(() => S3.destroy());

describe('#getBuckets', () => {
  test('should successfully retrieve buckets', async () => {
    // Fetch buckets
    const buckets = await S3.getBuckets();
    // Print Buckets
    logger.info('Bucket List:');
    buckets.forEach(bucket => logger.info(bucket.Name));
  });
});

describe('#listObjects', () => {
  test('should retrieve all the objects in the specified bucket', async () => {
    // Get objects
    const objects = await S3.listObjects() || [];
    // Print items
    logger.info('Objects:');
    objects.forEach(item => logger.info(item.Key));
  });
});

describe('Object Transfer', () => {
  // Setup: Upload file
  test('should upload file', async () => {
    await S3.uploadObject({
      Key: 'foo/globals.js',
      Bucket: 'image-sharing-project',
      Body: fs.readFileSync(path.join(__dirname, '../globals.js')),
    });
  });

  // Test if file was uploaded
  test('should get globals.js from foo/', async () => {
    expect.assertions(1);
    // Then verify that the file exists.
    const object = await S3.getObject({
      Key: 'foo/globals.js',
    });
    expect(object).toBeTruthy();
  });

  test('should pre-sign url', async () => {
    const url = await S3.getPreSignedURL({
      Bucket: 'image-sharing-project',
      Key: 'foo/globals.js',
    });

    logger.info(url);
  });

  // Teardown: Delete uploaded file
  test('should delete file', async () => {
    await S3.deleteObject({ Key: 'foo/globals.js' });
  });
});
