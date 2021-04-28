"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("../globals");
const ErrorHandler = function handleError(err, req, res, next) {
    res.status(err.status).send({
        status: err.status,
        title: err.title,
        description: err.description,
        instance: err.instance,
    });
    // Log the error to console only for debugging purposes
    if (process.env.NODE_ENV !== 'production') {
        globals_1.logger.error(err);
    }
    next();
};
exports.default = ErrorHandler;
