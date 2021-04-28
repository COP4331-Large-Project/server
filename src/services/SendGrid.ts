import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const SendGrid = {
  sendMessage: async (message: sgMail.MailDataRequired) => sgMail.send(message),
};

export default SendGrid;
