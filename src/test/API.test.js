import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Client from 'socket.io-client';
import initWebServer from '../services/webServer';
import Socket from '../services/Socket';
import UserModel from '../models/user';
import GroupModel from '../models/group';

let app;
jest.setTimeout(20000);

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
}, 30000);

afterAll(async (done) => {
  await UserModel.findOneAndDelete({ _id: userPayload.id });
  await GroupModel.findOneAndDelete({ inviteCode: groupPayload.inviteCode });
  // Shut down web server.
  await mongoose.connection.close();
  done();
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
    delete response.body.imgURL;
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
      .send({ creator: userPayload.id, name: 'My group name' })
      .expect('Content-Type', /json/)
      .expect(200);

    groupPayload = res.body;

    expect(res.body).toMatchObject(groupPayload);
  });

  test('Join new group', async () => {
    const res = await request(app)
      .post(`/groups/join/${groupPayload.inviteCode}`)
      .send({ user: userPayload.id })
      .expect(204);

    groupPayload.invitedUsers = res.body.invitedUsers;
  });
});

describe('Socket test', () => {
  let io;
  let serverSocket;
  let clientSocket;

  beforeAll((done) => {
    io = Socket.createServer();
    Socket.getHttpServer().listen(() => {
      const { port } = Socket.getHttpServer().address();
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should work', (done) => {
    clientSocket.on('hello', (arg) => {
      expect(arg).toBe('world');
      done();
    });
    serverSocket.emit('hello', 'world');
  });

  test('should work (with ack)', (done) => {
    serverSocket.on('hi', (cb) => {
      cb('hola');
    });
    clientSocket.emit('hi', (arg) => {
      expect(arg).toBe('hola');
      done();
    });
  });
});
