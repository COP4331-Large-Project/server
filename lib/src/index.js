"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const globals_1 = require("./globals");
const webServer_1 = __importDefault(require("./services/webServer"));
(async function main() {
    // Load in environment variables from file.
    dotenv_1.default.config();
    const httpServer = await webServer_1.default();
    // Log host
    if (process.env.NODE_ENV !== 'production') {
        globals_1.logger.info('Server is running on http://localhost:5000');
    }
    // Start listening for webserver connections.
    httpServer.listen(process.env.PORT || 5000);
}());
