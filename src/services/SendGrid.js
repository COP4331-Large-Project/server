import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  sendMessage: async (message) => sgMail.send(message),
};

export default SendGrid;
