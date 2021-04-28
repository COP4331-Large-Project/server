"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const APIError_1 = __importDefault(require("./APIError"));
const swaggerSpecs = () => {
    let schema;
    try {
        schema = js_yaml_1.default.load(fs_1.default.readFileSync('./src/schemas.yml', 'utf8'));
    }
    catch (e) {
        return new APIError_1.default();
    }
    const options = {
        definition: {
            openapi: '3.0.3',
            swagger: '3.0.3',
            info: {
                title: 'ImageUs API',
                description: 'This is the ImageUs API documentation',
                license: {
                    name: 'MIT',
                    url: 'https://spdx.org/licenses/MIT.html',
                },
            },
            servers: [
                {
                    url: 'http://localhost:5000/',
                    description: 'local server',
                },
                {
                    url: 'https://api.imageus.io/',
                    description: 'production server',
                },
            ],
            components: {
                schemas: schema,
            },
        },
        schemes: ['http'],
        apis: ['./src/routes/*.js'],
    };
    return swagger_jsdoc_1.default(options);
};
exports.default = swaggerSpecs;
