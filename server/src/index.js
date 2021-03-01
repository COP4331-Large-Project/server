import express from 'express';
import initStaticWebFiles from './modules/react-web.js';

const app = express();
initStaticWebFiles(app);

console.log('Server is running on http://localhost:8080');

app.listen(8080);
