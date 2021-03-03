import express from 'express';
import { logger } from './modules/globals.js';
import initStaticWebFiles from './modules/react-web.js';
import connectToDB from './modules/mongo.js';

const app = express();
initStaticWebFiles(app);

logger.info('Server is running on http://localhost:8080');

app.listen(process.env.PORT || 3000);

connectToDB();
