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
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
/**
 * @typedef Message
 * @property {String} to The email to send to
 * @property {String} from The email we are sending from
 * @property {String} subject The subject line of the email
 * @optional {String} [text] body of the email
 * @optional {String} [html] body of the email
 */
const SendGrid = {
    /**
     *
     * @param message {Message}
     * @returns {Promise<[ClientResponse, {}]>}
     */
    sendMessage: (message) => __awaiter(void 0, void 0, void 0, function* () { return mail_1.default.send(message); }),
};
exports.default = SendGrid;
