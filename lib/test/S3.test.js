"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    test('should successfully retrieve buckets', () => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch buckets
        const buckets = yield S3_1.default.getBuckets();
        // Print Buckets
        globals_1.logger.info('Bucket List:');
        buckets.forEach(bucket => globals_1.logger.info(bucket.Name));
    }));
});
describe('#listObjects', () => {
    test('should retrieve all the objects in the specified bucket', () => __awaiter(void 0, void 0, void 0, function* () {
        // Get objects
        const objects = (yield S3_1.default.listObjects()) || [];
        // Print items
        globals_1.logger.info('Objects:');
        objects.forEach(item => globals_1.logger.info(item.Key));
    }));
});
describe('Object Transfer', () => {
    // Setup: Upload file
    test('should upload file', () => __awaiter(void 0, void 0, void 0, function* () {
        yield S3_1.default.uploadObject('foo/globals.js', fs_1.default.readFileSync(path_1.default.join(__dirname, '../globals.js')));
    }));
    // Test if file was uploaded
    test('should get globals.js from foo/', () => __awaiter(void 0, void 0, void 0, function* () {
        // Then verify that the file exists.
        const object = yield S3_1.default.getObject('foo/globals.js');
        expect(object).toBeTruthy();
    }));
    test('should pre-sign url', () => __awaiter(void 0, void 0, void 0, function* () {
        const url = yield S3_1.default.getPreSignedURL('foo/globals.js');
        globals_1.logger.info(url);
    }));
    // Teardown: Delete uploaded file
    test('should delete file', () => __awaiter(void 0, void 0, void 0, function* () {
        yield S3_1.default.deleteObject('foo/globals.js');
    }));
});
