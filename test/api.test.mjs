import request from 'supertest';
import {app, closeServer } from '../server.mjs';

describe('API Tests', () => {
    afterAll(async () => {
        await closeServer(); // Stop the server after tests
    });

    it('should return a success message', async () => {
        const response = await request(app)
            .get('/api')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toHaveProperty('api', 'Please, use my api for getting articles!');
    });

    it('should return a list of routes', async () => {
        const response = await request(app)
            .get('/routes')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual( [
            {"method": "POST", "path": "/api/users/register"},
            {"method": "POST", "path": "/api/users/login"},
            {"method": "POST", "path": "/api/users/logout"},
            {"method": "POST", "path": "/api/users/refreshToken"},
            {"method": "POST", "path": "/api/users/reset-password"},
            {"method": "POST", "path": "/api/users/request-password-reset-code"},
            {"method": "POST", "path": "/api/users/verify-reset-code"},
            {"method": "GET", "path": "/api/users/me"},
            {"method": "POST", "path": "/api/articles/"},
            {"method": "GET", "path": "/api/articles/"},
            {"method": "GET", "path": "/api/articles/:id"},
            {"method": "PUT", "path": "/api/articles/:id"},
            {"method": "PATCH", "path": "/api/articles/:id/status"},
            {"method": "DELETE", "path": "/api/articles/:id"},
            {"method": "POST", "path": "/api/articles/:id/comments"},
            {"method": "GET", "path": "/api/articles/:id/comments"},
            {"method": "POST", "path": "/api/forms/booking/"},
            {"method": "GET", "path": "/api/forms/booking/"},
            {"method": "GET", "path": "/api/forms/booking/:date"},
            {"method": "DELETE", "path": "/api/forms/booking/:id"},
            {"method": "PUT", "path": "/api/forms/booking/:id"},
            {"method": "POST", "path": "/api/slots/"},
            {"method": "GET", "path": "/api/slots/"},
            {"method": "GET", "path": "/api/slots/:date"},
            {"method": "PUT", "path": "/api/slots/:id"},
            {"method": "POST", "path": "/api/ai/generate-image"},
            {"method": "POST", "path": "/api/products/"},
            {"method": "GET", "path": "/api/products/"},
            {"method": "GET", "path": "/api/products/:id"},
            {"method": "DELETE", "path": "/api/products/:id"},
            {"method": "PUT", "path": "/api/products/:id"},
            {"method": "POST", "path": "/api/forms/checkout/address-details"},
            {"method": "POST", "path": "/api/forms/checkout/create-payment-intent"},
            {"method": "GET", "path": "/api/news"},
            {"method": "GET", "path": "/api"},
            {"method": "GET", "path": "/routes"}
        ]);
    })
});
