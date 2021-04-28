"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const ROUNDS = 10;
const PasswordHasher = {
    hash: async (plaintext) => bcrypt_1.default.hash(plaintext, ROUNDS),
    validateHash: async (plaintext, hash) => bcrypt_1.default.compare(plaintext, hash),
};
exports.default = PasswordHasher;
