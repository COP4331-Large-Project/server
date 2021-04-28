"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const S3_1 = __importDefault(require("../services/S3"));
const globals_1 = require("../globals");
afterAll(() => S3_1.default.destroy());
describe('#getBuckets', () => {
    test('should successfully retrieve buckets', async () => {
        // Fetch buckets
        const buckets = await S3_1.default.getBuckets();
        // Print Buckets
        globals_1.logger.info('Bucket List:');
        buckets.forEach(bucket => globals_1.logger.info(bucket.Name));
    });
});
describe('#listObjects', () => {
    test('should retrieve all the objects in the specified bucket', async () => {
        // Get objects
        const objects = await S3_1.default.listObjects() || [];
        // Print items
        globals_1.logger.info('Objects:');
        objects.forEach(item => globals_1.logger.info(item.Key));
    });
});
describe('Object Transfer', () => {
    // Setup: Upload file
    test('should upload file', async () => {
        await S3_1.default.uploadObject('foo/globals.js', fs_1.default.readFileSync(path_1.default.join(__dirname, '../globals.js')));
    });
    // Test if file was uploaded
    test('should get globals.js from foo/', async () => {
        // Then verify that the file exists.
        const object = await S3_1.default.getObject('foo/globals.js');
        expect(object).toBeTruthy();
    });
    test('should pre-sign url', async () => {
        const url = await S3_1.default.getPreSignedURL('foo/globals.js');
        globals_1.logger.info(url);
    });
    // Teardown: Delete uploaded file
    test('should delete file', async () => {
        await S3_1.default.deleteObject('foo/globals.js');
    });
});
