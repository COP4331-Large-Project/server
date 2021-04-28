"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SendGrid_1 = __importDefault(require("../services/SendGrid"));
describe('SendGrid Test', () => {
    const message = {
        to: 'no-reply@imageus.io',
        from: 'no-reply@imageus.io',
        subject: 'Test',
        text: 'This is a test email',
    };
    test.skip('Send mail', async () => {
        const response = await SendGrid_1.default.sendMessage(message);
        expect(response).toBeTruthy();
    });
});
