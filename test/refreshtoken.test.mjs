import request from 'supertest';
import { app, closeServer } from '../server.mjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {AUTH_HEADER} from "../constants/auth.mjs";

const PROTECTED_ROUTE = '/api/slots/'
describe('Authentication API', () => {
    let mongoServer;
    let accessToken, refreshToken;
    let userId;

    // Before all tests, sign in to get access and refresh tokens
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        const registerResponse = await request(app)
            .post('/api/users/register')  // Assuming the endpoint to create a new user
            .send({
                name: "Max Test",
                email: 'max2@example.com',
                password: '123456',
                confirmPassword: '123456',
                role: USER_ROLE  // Include other necessary fields based on your user schema
            });

        // Log in and get the tokens
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'max2@example.com',
                password: '123456'
            });

        accessToken = loginResponse.body.data.accessToken;
        userId = loginResponse.body.data.userId;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // Additional tests for authentication scenarios
    test('Access protected route with valid token', async () => {
        const response = await request(app)
            .get(PROTECTED_ROUTE)
            .set(AUTH_HEADER, `${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data'); // Ensuring some data is returned
    });

    // Test for token refresh scenario
    test('Token refresh when access token is expired', async () => {
        // Simulating expired access token handling
        const expiredResponse = await request(app)
            .get(PROTECTED_ROUTE)
            .set(AUTH_HEADER, `Bearer expiredAccessToken`); // Expired token used here

        expect(expiredResponse.status).toBe(401); // Unauthorized due to expiration

        // Attempt to refresh the token
        const refreshResponse = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken }); // Use the stored refreshToken for refreshing

        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body).toHaveProperty('accessToken'); // Ensure new access token is issued

        // Use the new access token to access the protected route again
        const newAccessResponse = await request(app)
            .get('/api/protected')
            .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`);

        expect(newAccessResponse.status).toBe(200);
        expect(newAccessResponse.body).toHaveProperty('data'); // Check data availability
    });

    // You can write additional tests for other scenarios here
});
