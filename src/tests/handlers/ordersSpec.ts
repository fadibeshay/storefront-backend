import supertest from 'supertest';
import app from '../../index';
import {
  OrderStore,
  Order,
  OrderStatus,
  OrderProduct,
} from '../../models/order';
import { Product, ProductStore } from '../../models/product';
import { UserRole, User, UserStore } from '../../models/user';

const request = supertest(app);
const productStore = new ProductStore();
const userStore = new UserStore();
const orderStore = new OrderStore();

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

const order: Order = {
  id: 1,
  userId: 1,
  status: OrderStatus.ACTIVE,
};

const orderProduct: OrderProduct = {
  id: 1,
  orderId: 1,
  productId: 1,
  quantity: 2,
};

let token: string;

describe('Tests for orders endpoints', (): void => {
  beforeAll(async (): Promise<void> => {
    // Add an admin user
    await userStore.create(user);
    const response = await request
      .post('/users/authenticate')
      .send({ username: user.username, password: user.password });
    user.id = response.body.id;
    order.userId = response.body.id;
    token = response.body.token;

    // Add a new product
    const newProduct = await productStore.create(product);
    product.id = newProduct.id;
    orderProduct.productId = newProduct.id as number;
  });

  afterAll(async (): Promise<void> => {
    await orderStore.removeProduct(order.id as number, product.id as number);
    await orderStore.delete(order.id as number);
    await productStore.delete(product.id as number);
    await userStore.delete(user.id as number);
  });

  describe('Tests for POST /orders', (): void => {
    it('should return status code 200 and a new order', async (): Promise<void> => {
      const response = await request
        .post('/orders')
        .send(order)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(order.status);
      order.id = response.body.id;
    });

    it('should return status code 401 if token is not sent', async (): Promise<void> => {
      const response = await request.post('/orders');
      expect(response.status).toBe(401);
    });
  });

  describe('Tests for POST /orders/:id/products endpoint', (): void => {
    it('should return status code 200 and the correct order_product', async (): Promise<void> => {
      const response = await request
        .post(`/orders/${order.id}/products`)
        .send(orderProduct)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(orderProduct.quantity);
      orderProduct.id = response.body.id;
    });

    it('should return status code 400 if one field is missing or invalid', async (): Promise<void> => {
      const response = await request
        .post(`/orders/${order.id}/products`)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(400);
    });

    it('should return status code 401 if token is not sent', async (): Promise<void> => {
      const response = await request.post(`/orders/${order.id}/products`);
      expect(response.status).toBe(401);
    });
  });
});
