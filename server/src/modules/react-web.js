import path from 'path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import __dirname from './globals.js';

/**
 * Bootstraps the statically generated web files from react
 * to the server.
 *
 * @param {Express} app The express app.
 */
function initStaticWebFiles(app) {
  const rateLimiter = rateLimit({
    windowMs: 0.25 * 1000, // 1/4 second
    max: 5,
  });
  const filePath = path.join(__dirname, '../../../client/build');

  // Apply the rate limiter
  app.use(rateLimiter);

  // Check if website has been built
  if (!fs.existsSync(filePath)) {
    console.error('Skipping setting up react web files...');
    console.error(
      "Run 'npm run build' in the client directory to upload the react website.",
    );
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    // Hook Up React static website files for frontend
    app.use(express.static(filePath));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
  }
}

export default initStaticWebFiles;
