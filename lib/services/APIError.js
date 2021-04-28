"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class APIError extends Error {
    constructor(title = 'Server Error', description = 'An internal server error occurred', status = 500, instance = null) {
        super(title);
        this.title = title;
        this.description = description;
        this.status = status;
        this.instance = instance;
    }
}
exports.default = APIError;
