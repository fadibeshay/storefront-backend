import supertest from 'supertest';
import app from '../../index';
import { Product, ProductStore } from '../../models/product';
import { UserRole, User, UserStore } from '../../models/user';

const request = supertest(app);
const productStore = new ProductStore();
const userStore = new UserStore();

const user: User = {
  id: 1,
  username: 'admin',
  firstName: 'John',
  lastName: 'Doe',
  password: 'password123',
  role: UserRole.ADMIN,
};

const product: Product = {
  id: 1,
  name: 'test product',
  price: 10,
  category: 'test category',
};

let token: string;

describe('Tests for products endpoints', (): void => {
  beforeAll(async (): Promise<void> => {
    await userStore.create(user);
    const response = await request
      .post('/users/authenticate')
      .send({ username: user.username, password: user.password });
    user.id = response.body.id;
    token = response.body.token;
  });

  afterAll(async (): Promise<void> => {
    productStore.delete(product.id as number);
    userStore.delete(user.id as number);
  });

  describe('Tests for POST /products', (): void => {
    it('should return status code 200 and a new product', async (): Promise<void> => {
      const response = await request
        .post('/products')
        .send(product)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(product.name);
      product.id = response.body.id;
    });

    it('should return status code 400 if one field is missing or invalid', async (): Promise<void> => {
      const response = await request
        .post('/products')
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(400);
    });

    it('should return status code 401 if token is not sent', async (): Promise<void> => {
      const response = await request.post('/products');
      expect(response.status).toBe(401);
    });
  });

  describe('Tests for GET /products/:id endpoint', (): void => {
    it('should return status code 200 and the correct product', async (): Promise<void> => {
      const response = await request.get(`/products/${product.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });

    it('should return status code 404 if product id is wrong', async (): Promise<void> => {
      const response = await request.get(`/products/1000`);
      expect(response.status).toBe(404);
    });
  });

  describe('Tests for GET /products endpoint', (): void => {
    it('should return status code 200 and an array of products', async (): Promise<void> => {
      const response = await request.get('/products');
      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe(product.name);
    });
  });
});
