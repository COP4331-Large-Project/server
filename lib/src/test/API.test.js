"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const webServer_1 = __importDefault(require("../services/webServer"));
const user_1 = __importDefault(require("../models/user"));
const group_1 = __importDefault(require("../models/group"));
let app;
jest.setTimeout(30000);
// Random username generation
const username = uuid_1.v4();
const password = 'test';
const email = uuid_1.v4();
// The expected body to recieve for login and register.
const userPayload = {
    firstName: 'test123',
    lastName: 'test456',
    email: `${email}@email.com`,
    username,
};
let groupPayload;
let jwtToken;
// Initialize the web app.
beforeAll(async () => {
    app = await webServer_1.default(app);
});
afterAll(async () => {
    await user_1.default.findOneAndDelete({ _id: userPayload.id });
    await group_1.default.findOneAndDelete({ inviteCode: groupPayload.inviteCode });
    // Shut down web server.
    await mongoose_1.default.connection.close();
});
describe('User API methods', () => {
    // Make sure we clean up.
    test('Creating a user', async () => {
        const response = await supertest_1.default(app)
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
        const response = await supertest_1.default(app)
            .post(`/users/${userPayload.id}/verify`)
            .send({
            verificationCode: userPayload.verificationCode,
        })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body).toMatchObject(userPayload);
    });
    test('Logging user in', async () => {
        const res = await supertest_1.default(app)
            .post('/users/login')
            .send({
            username: userPayload.username,
            password,
        })
            .expect('Content-Type', /json/)
            .expect(200);
        jwtToken = res.body.token;
        expect(res.body).toMatchObject(userPayload);
    });
    test('Sending password reset email', async () => {
        const res = await supertest_1.default(app)
            .post('/users/passwordRecovery')
            .send({ email: userPayload.email })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(res.body).toMatchObject(userPayload);
    });
    // we will get the verifcation code generated above to simulate
    // clicking the link in the email
    test('Getting user', async () => {
        const res = await supertest_1.default(app)
            .get(`/users/${userPayload.id}`)
            .set('Authorization', jwtToken)
            .expect('Content-Type', /json/)
            .expect(200);
        userPayload.verificationCode = res.body.verificationCode;
        expect(res.body).toMatchObject(userPayload);
    });
    test('Reset password', async () => {
        await supertest_1.default(app)
            .post('/users/resetPassword')
            .send({
            userId: userPayload.id,
            verificationCode: userPayload.verificationCode,
            password: 'password',
        })
            .expect(204);
    });
    test('Update user', async () => {
        const res = await supertest_1.default(app)
            .put(`/users/${userPayload.id}`)
            .set('Authorization', jwtToken)
            .send({ firstName: `${userPayload.firstName}Updated` })
            .expect('Content-Type', /json/)
            .expect(200);
        userPayload.firstName = `${userPayload.firstName}Updated`;
        expect(res.body).toMatchObject(userPayload);
    });
});
describe('Group API Methods', () => {
    test('Creating new group', async () => {
        const res = await supertest_1.default(app)
            .post('/groups')
            .send({
            creator: userPayload.id, name: 'My group Name', publicGroup: true, emails: [],
        })
            .expect('Content-Type', /json/)
            .expect(200);
        groupPayload = res.body;
        expect(res.body).toMatchObject(groupPayload);
    });
    test('Get group', async () => {
        const res = await supertest_1.default(app)
            .get(`/groups/${groupPayload.id}`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(res.body.creator === userPayload.id);
    });
    // this is a user endpoint
    test('Show Group Membership', async () => {
        const res = await supertest_1.default(app)
            .get(`/users/${userPayload.id}/groups`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(res.body[0].id === groupPayload.id);
    });
});
