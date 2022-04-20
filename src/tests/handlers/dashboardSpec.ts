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
import { DashboardQueries } from '../../services/dashboard';

const request = supertest(app);
const productStore = new ProductStore();
const userStore = new UserStore();
const orderStore = new OrderStore();
const dashboardQueries = new DashboardQueries();

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

const activeOrder: Order = {
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

describe('Tests for dashboard endpoints', (): void => {
  beforeAll(async (): Promise<void> => {
    // Add an admin user
    await userStore.create(user);
    const response = await request
      .post('/users/authenticate')
      .send({ username: user.username, password: user.password });
    user.id = response.body.id;
    activeOrder.userId = response.body.id;
    token = response.body.token;

    // Add a new product
    const newProduct = await productStore.create(product);
    product.id = newProduct.id;
    orderProduct.productId = newProduct.id as number;

    // Add a new order and add a product to it
    const newOrder = await orderStore.create(activeOrder);
    activeOrder.id = newOrder.id;
    orderProduct.orderId = newOrder.id as number;
    const newOrderProduct = await orderStore.addProduct(orderProduct);
    orderProduct.id = newOrderProduct.id;
  });

  afterAll(async () => {
    await orderStore.removeProduct(
      activeOrder.id as number,
      product.id as number
    );
    await productStore.delete(product.id as number);
    await orderStore.delete(activeOrder.id as number);
    await userStore.delete(user.id as number);
  });

  describe('Tests for GET /current_order', (): void => {
    it('should return status code 200 and order with products', async (): Promise<void> => {
      const expectedResult = {
        id: activeOrder.id as number,
        userId: activeOrder.userId,
        status: activeOrder.status,
        products: [product],
      };
      const response = await request
        .get('/current_order')
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
    });

    it('should return status code 401 if token is not sent', async (): Promise<void> => {
      const response = await request.get('/current_order');
      expect(response.status).toBe(401);
    });
  });
});
