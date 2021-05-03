import S3 from '../services/S3';
import { logger } from '../globals';

afterAll(() => S3.destroy());

describe('#getBuckets', () => {
  test('should successfully retrieve buckets', async () => {
    // Fetch buckets
    const buckets = await S3.getBuckets();

    if (!buckets) {
      throw new Error('Could not fetch buckets');
    }

    // Print Buckets
    logger.info('Bucket List:');
    buckets.forEach(bucket => logger.info(bucket.Name ?? ''));
  });
});

// describe.skip('#listObjects', () => {
//   test.skip('should retrieve all the objects in the specified bucket', async () => {
//     // Get objects
//     const objects = await S3.listObjects() || [];
//     // Print items
//     logger.info('Objects:');
//     objects.forEach(item => logger.info(item.Key as string));
//   });
// });

describe('Object Transfer', () => {
  // Setup: Upload file
  test('should upload file', async () => {
    await S3.uploadObject(
      'foo/globals.ts',
      Buffer.from('test', 'utf-8'),
    );
  });

  // Test if file was uploaded
  test('should get globals.js from foo/', async () => {
    // Then verify that the file exists.
    const object = await S3.getObject('foo/globals.ts');
    expect(object).toBeTruthy();
  });

  test('should pre-sign url', async () => {
    const url = await S3.getPreSignedURL('foo/globals.ts');

    logger.info(url);
  });

  // Teardown: Delete uploaded file
  test('should delete file', async () => {
    await S3.deleteObject('foo/globals.ts');
  });
});
