import path from 'path';
import express from 'express';
import fs from 'fs';
import __dirname from './globals.js';

/**
 * Bootstraps the statically generated web files from react
 * to the server.
 *
 * @param {Express} app The express app.
 */
function initStaticWebFiles(app) {
  const filePath = path.join(__dirname, '../../../client/build');

  // Check if website has been built
  if (!fs.existsSync(filePath)) {
    console.error('Skipping setting up react web files...');
    console.error('Run \'npm run build\' in the client directory to upload the react website.');
    return;
  }

  // Hook Up React static website files for frontend
  app.use(express.static(filePath));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

export default initStaticWebFiles;
