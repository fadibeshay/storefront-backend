import supertest from 'supertest';
import app from '../../index';
import { UserRole, User, UserStore } from '../../models/user';

const request = supertest(app);

const user: User = {
  id: 1,
  username: 'janedoe',
  firstName: 'Jane',
  lastName: 'Doe',
  password: 'password123',
  role: UserRole.USER,
};

let token: string;

const userStore = new UserStore();

describe('Tests for users handler', (): void => {
  afterAll(async (): Promise<void> => {
    userStore.delete(user.id as number);
  });

  describe('Tests for POST /users endpoint', (): void => {
    it('should return status code 200 and a token', async (): Promise<void> => {
      const response = await request.post('/users').send(user);
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      user.id = response.body.id;
      token = response.body.token;
    });

    it('should return status code 400 if one field is missing or invalid', async (): Promise<void> => {
      const response = await request.post('/users');
      expect(response.status).toBe(400);
    });
  });

  describe('Tests for GET /users endpoint', (): void => {
    it('should return status code 200 and an array of users', async (): Promise<void> => {
      const response = await request
        .get('/users')
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body[0].username).toBe(user.username);
    });

    it('should return status code 401 if no token sent', async (): Promise<void> => {
      const response = await request.get('/users');
      expect(response.status).toBe(401);
    });
  });

  describe('Tests for POST /users/authenitcate endpoint', (): void => {
    it('should return status code 200 and a token', async (): Promise<void> => {
      const response = await request
        .post('/users/authenticate')
        .send({ username: user.username, password: user.password });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.id).toBe(user.id);
      token = response.body.token;
    });

    it('should return status code 400 if one field is missing', async (): Promise<void> => {
      const response = await request.post('/users/authenticate');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'username is required, password is required'
      );
    });

    it('should return status code 400 if username/password is incorrect', async (): Promise<void> => {
      const response = await request
        .post('/users/authenticate')
        .send({ username: 'invalid', password: 'invalid' });
      expect(response.status).toBe(400);
    });
  });

  describe('Tests for GET /users/:id endpoint', (): void => {
    it('should return status code 200 and the correct user', async (): Promise<void> => {
      const response = await request
        .get(`/users/${user.id}`)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(user.username);
    });

    it('should return status code 401 if no token sent', async (): Promise<void> => {
      const response = await request.get(`/users/${user.id}`);
      expect(response.status).toBe(401);
    });
  });
});
