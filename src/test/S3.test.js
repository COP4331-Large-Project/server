import { getBuckets, listObjects, uploadObject } from '../modules/s3.js';
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
    const objects = await listObjects();
    // Print items
    logger.info('Objects:');
    objects.forEach(item => logger.info(item.Key));
  });
});

describe('#uploadObject', () => {
  it('should upload globals.js into foo/', async () => {
    const data = uploadObject({
      Key: 'globals.js',
      Path: 'foo/',
      File: '../modules/globals.js',
    });
    logger.info(data);
  });
});
