import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import initWebServer from '../services/webServer';
import SendGrid from '../services/SendGrid';
import UserModel from '../models/user';
import GroupModel from '../models/group';

let app;

jest.setTimeout(30000);

// Random username generation
const username = uuidv4();
const password = 'test';

// The expected body to recieve for login and register.
const userPayload = {
  firstName: 'test123',
  lastName: 'test456',
  email: '1234@email.com',
  username,
};

let groupPayload;

// Initialize the web app.
beforeAll(async () => {
  app = await initWebServer(app);
});

afterAll(async () => {
  await UserModel.findOneAndDelete({ _id: userPayload.id });
  await GroupModel.findOneAndDelete({ inviteCode: groupPayload.inviteCode });
  // Shut down web server.
  await mongoose.connection.close();
});

describe('User API methods', () => {
  // Make sure we clean up.

  test('Creating a user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        email: userPayload.email,
        username,
        password,
      })
      .expect('Content-Type', /json/)
      .expect(201);

    userPayload.id = response.body.id;
    userPayload.verificationCode = response.body.verificationCode;
    delete response.body.imgURL;
    expect(response.body).toMatchObject(userPayload);
  });

  test('Verifying user', async () => {
    const response = await request(app)
      .post(`/users/${userPayload.id}/verify`)
      .send({
        verificationCode: userPayload.verificationCode,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchObject(userPayload);
  });

  test('Logging user in', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        username: userPayload.username,
        password,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject(userPayload);
  });
});

describe('Group API Methods', () => {
  test('Creating new group', async () => {
    const res = await request(app)
      .post('/groups')
      .send({
        creator: userPayload.id, name: 'My group Name', publicGroup: true, emails: [],
      })
      .expect('Content-Type', /json/)
      .expect(200);

    groupPayload = res.body;

    expect(res.body).toMatchObject(groupPayload);
  });

  test('Join new group', async () => {
    const res = await request(app)
      .post(`/groups/${groupPayload.inviteCode}/join`)
      .send({ user: userPayload.id })
      .expect(204);

    groupPayload.invitedUsers = res.body.invitedUsers;
  });
});

describe('SendGrid Test', () => {
  const message = {
    to: 'no-reply@imageus.io',
    from: 'no-reply@imageus.io',
    subject: 'Test',
    text: 'This is a test email',
  };
  test('Send mail', async () => {
    const response = await SendGrid.sendMessage(message);

    expect(response);
  });
});
