import {
  OrderStatus,
  Order,
  OrderStore,
  OrderProduct,
} from '../../models/order';
import { Product, ProductStore } from '../../models/product';
import { User, UserRole, UserStore } from '../../models/user';
import { DashboardQueries } from '../../services/dashboard';

const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();
const dashboardQueries = new DashboardQueries();

describe('Tests for dashboard service', (): void => {
  const activeOrder: Order = {
    id: 1,
    userId: 1,
    status: OrderStatus.ACTIVE,
  };

  const user: User = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    password: 'password123',
  };

  const orderProduct: OrderProduct = {
    id: 1,
    orderId: 1,
    productId: 1,
    quantity: 2,
  };

  const product: Product = {
    id: 1,
    name: 'test product',
    price: 10,
    category: 'test category',
  };

  beforeAll(async () => {
    // Add a new user
    const newUser = await userStore.create(user);
    user.id = newUser.id;
    activeOrder.userId = newUser.id as number;

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

  it('should have CurrentOrderByUser method', (): void => {
    expect(dashboardQueries.CurrentOrderByUser).toBeDefined();
  });

  it('CurrentOrderByUser method should get order with products', async (): Promise<void> => {
    const orderWithProducts = await dashboardQueries.CurrentOrderByUser(
      user.id as number
    );

    const expectedResult = {
      id: activeOrder.id as number,
      userId: activeOrder.userId,
      status: activeOrder.status,
      products: [product],
    };

    expect(orderWithProducts).toEqual(expectedResult);
  });

  it('CurrentOrderByUser method should throw an error is user id is not found', async (): Promise<void> => {
    await expectAsync(
      dashboardQueries.CurrentOrderByUser(1000)
    ).toBeRejectedWithError(
      'Could not get current order for user 1000. There is no active order.'
    );
  });
});
