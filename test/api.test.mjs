import request from 'supertest';
import {app, closeServer } from '../server.mjs';

describe('API Tests', () => {
    afterAll(() => {
        closeServer(); // Stop the server after tests
    });

    it('should return a success message', async () => {
        const response = await request(app)
            .get('/api')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toHaveProperty('api', 'Please, use my api for getting articles!!!');
    });
});
