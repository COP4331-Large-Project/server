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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const mongo_1 = require("./mongo");
const Socket_1 = __importDefault(require("./Socket"));
const routes_1 = __importDefault(require("../routes"));
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
const swagger_1 = __importDefault(require("./swagger"));
const app = express_1.default();
exports.app = app;
function initWebServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const httpServer = http_1.createServer(app);
        Socket_1.default(httpServer);
        yield mongo_1.connectToDB();
        // Enable cross origin
        app.use(cors_1.default(), express_1.default.json(), express_mongo_sanitize_1.default(), routes_1.default, ErrorHandler_1.default);
        // Enable swagger
        app.use('/', swagger_ui_express_1.default.serve);
        app.get('/', swagger_ui_express_1.default.setup(swagger_1.default(), { explorer: true }));
        return httpServer;
    });
}
exports.default = initWebServer;
