import SendGrid from '../services/SendGrid';

describe('SendGrid Test', () => {
  const message = {
    to: 'no-reply@imageus.io',
    from: 'no-reply@imageus.io',
    subject: 'Test',
    text: 'This is a test email',
  };
  test.skip('Send mail', async () => {
    const response = await SendGrid.sendMessage(message);

    expect(response).toBeTruthy();
  });
});
