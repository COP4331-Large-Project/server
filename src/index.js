import express from 'express';
import { logger } from './modules/globals.js';
import initStaticWebFiles from './modules/react-web.js';
import connectToDB from './modules/mongo.js';
import getBuckets from './modules/s3.js';

const app = express();
initStaticWebFiles(app);

if (process.env.NODE_ENV !== 'production') {
  logger.info('Server is running on http://localhost:5000');
}

app.listen(process.env.PORT || 5000);

connectToDB();
getBuckets().then((buckets) => {
  logger.info('Fetched Buckets: ');
  buckets.forEach(bucket => logger.info(bucket.Name));
})
  .catch(error => logger.warn(error));
