import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import initWebServer from '../services/webServer';
import UserModel from '../models/user';

let app;

// Initialize the web app.
beforeAll(async () => {
  app = await initWebServer(app);
});

describe('User API methods', () => {
  // Random username generation
  const username = uuidv4();
  const password = 'test';

  // The expected body to recieve for login and register.
  const expectedPayload = {
    firstName: 'test123',
    lastName: 'test456',
    username,
  };

  // Make sure we clean up.
  afterAll(async (done) => {
    // eslint-disable-next-line no-underscore-dangle
    await UserModel.findOneAndDelete({ _id: expectedPayload._id });
    // Shut down web server.
    await mongoose.connection.close();
    done();
  });

  test('Creating a user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        firstName: 'test123',
        lastName: 'test456',
        username,
        password,
      })
      .expect('Content-Type', /json/)
      .expect(201);

    // eslint-disable-next-line no-underscore-dangle
    expectedPayload._id = response.body._id;
    expect(response.body).toMatchObject(expectedPayload);
  });

  test('Logging user in', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        username: expectedPayload.username,
        password,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject(expectedPayload);
  });
});
