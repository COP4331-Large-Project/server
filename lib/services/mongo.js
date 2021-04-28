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
exports.disconnectFromDB = exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const globals_1 = require("../globals");
const connectToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    // Connection options
    const connectionOptions = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    };
    if (typeof process.env.MONGO_URI === 'undefined') {
        throw new Error('Connection unsuccessful: the URI was not provided');
    }
    try {
        // Create the DB connection.
        yield mongoose_1.default.connect(process.env.MONGO_URI, connectionOptions);
    }
    catch (error) {
        throw new Error(error);
    }
    // Set options
    mongoose_1.default.set('toJSON', {
        versionKey: false,
        useProjection: true,
        virtuals: true,
        /* eslint-disable no-param-reassign */
        /* eslint-disable no-underscore-dangle */
        transform: (doc, ret) => {
            delete ret._id;
        },
    });
    // Log the values.
    if (process.env.NODE_ENV !== 'production') {
        globals_1.logger.info(`MongoDB_URI = ${process.env.MONGO_URI}`);
    }
});
exports.connectToDB = connectToDB;
const disconnectFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    // Close the DB connection.
    yield mongoose_1.default.connection.close();
});
exports.disconnectFromDB = disconnectFromDB;
