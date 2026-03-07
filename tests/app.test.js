const request = require('supertest');
const app = require('../src/index');

describe('API Tests', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Welcome');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(userData.email);
      });

      it('should not register user with invalid email', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123',
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });

      it('should not register user with short password', async () => {
        const userData = {
          email: 'test2@example.com',
          password: '123',
          confirmPassword: '123',
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });

      it('should not register user with mismatched passwords', async () => {
        const userData = {
          email: 'test3@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword',
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        // First register a user
        const userData = {
          email: 'login@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        };

        await request(app).post('/api/auth/register').send(userData);

        // Then login
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password,
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      });

      it('should not login with invalid credentials', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('should not login with invalid email format', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: 'password123',
          })
          .expect(400);
      });
    });

    describe('Protected Routes', () => {
      let authToken;

      beforeAll(async () => {
        // Register and login to get auth token
        const userData = {
          email: 'protected@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        };

        await request(app).post('/api/auth/register').send(userData);

        const loginResponse = await request(app).post('/api/auth/login').send({
          email: userData.email,
          password: userData.password,
        });

        authToken = loginResponse.body.token;
      });

      it('should access protected route with valid token', async () => {
        await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });

      it('should not access protected route without token', async () => {
        await request(app).get('/api/users/profile').expect(401);
      });

      it('should not access protected route with invalid token', async () => {
        await request(app)
          .get('/api/users/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });
  });

  describe('Validation Tests', () => {
    it('should validate request body schema', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: '123', // too short
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation');
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=0&limit=200') // invalid pagination
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      await request(app).get('/api/non-existent-route').expect(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Database Tests', () => {
    it('should connect to database', async () => {
      // Test database connection
      const response = await request(app).get('/api/health/db').expect(200);

      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toBe('connected');
    });
  });
});

// Unit tests for utility functions
describe('Utility Functions', () => {
  describe('Logger', () => {
    const { logger } = require('../src/utils/logger');

    it('should log info messages', () => {
      expect(() => logger.info('Test info message')).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => logger.error('Test error message')).not.toThrow();
    });
  });

  describe('Validation Utils', () => {
    const { userSchemas } = require('../src/utils/validation');

    it('should validate correct user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const { error } = userSchemas.register.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const { error } = userSchemas.register.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
