import getBuckets from '../modules/s3.js';
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
