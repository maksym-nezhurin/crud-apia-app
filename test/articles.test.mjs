import request from 'supertest';
import { app } from '../server.mjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {AUTH_HEADER} from "../constants/auth.mjs";

const USER_ROLE = 'super admin';

describe('Article API Tests', () => {
    let mongoServer;
    let accessToken, userId, role;
    let articleId;

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

        role = registerResponse.body.data.payload.role;

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

    test('GET /api/articles should return all articles', async () => {
        const response = await request(app)
            .get('/api/articles')
            .set(AUTH_HEADER, accessToken); // Set custom token header
        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Object);
    });

    test('POST /api/articles should create an article and return the created article with a 201 status code', async () => {
        const newArticle = {
            title: "New Article",
            content: "This is the content of the new article.",
            tags: ["tag1", "tag2"],
            status: "draft"
        };

        const response = await request(app)
            .post('/api/articles')
            .set(AUTH_HEADER, accessToken) // Use the x-auth-token for authentication
            .send(newArticle)
            .expect('Content-Type', /json/)
            .expect(201);

        articleId = response.body.data.article._id;

        expect(response.body.data.article.title).toEqual(newArticle.title);
        expect(response.body.data.article.content).toEqual(newArticle.content);
        expect(response.body.data.article.tags).toEqual(expect.arrayContaining(newArticle.tags));
        expect(response.body.data.article.status).toEqual(newArticle.status);
    });

    test('PUT /api/articles/:id should update an article and return the updated article', async () => {
        const updatedData = {
            title: "Updated Title",
            content: "Updated Content",
            tags: ["updated", "test"],
            status: "published"
        };

        const response = await request(app)
            .put(`/api/articles/${articleId}`)
            .set(AUTH_HEADER, accessToken)
            .send(updatedData)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body.data.article.title).toEqual(updatedData.title);
        expect(response.body.data.article.content).toEqual(updatedData.content);
        expect(response.body.data.article.tags).toEqual(expect.arrayContaining(updatedData.tags));
        expect(response.body.data.article.status).toEqual(updatedData.status);

        // Check if the publishedAt date was set correctly for published status
        if (updatedData.status === 'published') {
            expect(new Date(response.body.data.article.publishedAt)).toBeInstanceOf(Date);
        }
    });

    test('DELETE /api/articles/:id should mark an article as deleted', async () => {
        // First, create an article to delete
        const newArticle = {
            title: "Article to Delete",
            content: "This article will be deleted in this test.",
            tags: ["delete", "test"],
            status: "draft"
        };

        const createResponse = await request(app)
            .post('/api/articles')
            .set(AUTH_HEADER, accessToken)
            .send(newArticle)
            .expect(201);
        const articleId = createResponse.body.data.article._id;

        // Now delete the article
        const deleteResponse = await request(app)
            .delete(`/api/articles/${articleId}`)
            .set(AUTH_HEADER, accessToken)
            .expect(200);

        expect(deleteResponse.body.data.message).toBe('Article marked as deleted');

        // Optionally, you can fetch the article to ensure it's marked as deleted
        const fetchResponse = await request(app)
            .get(`/api/articles/${articleId}`)
            .set(AUTH_HEADER, accessToken)
            .expect(200);

        expect(fetchResponse.body.data.article.isDeleted).toBe(true);
        expect(fetchResponse.body.data.article.deletedAt).toBeDefined();
        expect(role).toBe(USER_ROLE)
    });

});
