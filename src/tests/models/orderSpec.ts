import {
  OrderStatus,
  Order,
  OrderStore,
  OrderProduct,
} from '../../models/order';
import { Product, ProductStore } from '../../models/product';
import { User, UserRole, UserStore } from '../../models/user';

const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();

describe('Tests for order model', (): void => {
  const activeOrder: Order = {
    id: 1,
    userId: 1,
    status: OrderStatus.ACTIVE,
  };

  const completeOrder: Order = {
    id: 2,
    userId: 1,
    status: OrderStatus.COMPLETE,
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
    completeOrder.userId = newUser.id as number;

    // Add a new product
    const newProduct = await productStore.create(product);
    product.id = newProduct.id;
    orderProduct.productId = newProduct.id as number;
  });

  afterAll(async () => {
    await userStore.delete(user.id as number);
    await productStore.delete(product.id as number);
  });

  it('should have an index method', (): void => {
    expect(orderStore.index).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(orderStore.show).toBeDefined();
  });

  it('should have a create method', (): void => {
    expect(orderStore.create).toBeDefined();
  });

  it('should have an addProduct method', (): void => {
    expect(orderStore.addProduct).toBeDefined();
  });

  it('should have a removeProduct method', (): void => {
    expect(orderStore.removeProduct).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(orderStore.delete).toBeDefined();
  });

  it('create method should add a new order', async (): Promise<void> => {
    const order1 = await orderStore.create(activeOrder);
    activeOrder.id = order1.id;
    const order2 = await orderStore.create(completeOrder);
    completeOrder.id = order2.id;

    expect(order1).toEqual(activeOrder);
    expect(order2).toEqual(completeOrder);
  });

  it('show method should get the correct order', async (): Promise<void> => {
    const result = await orderStore.show(activeOrder.id as number);
    expect(result).toEqual(activeOrder);
  });

  it('show method should throw and error if id is incorrect', async (): Promise<void> => {
    await expectAsync(orderStore.show(1000)).toBeRejectedWithError();
  });

  it('show method should get a list of orders', async (): Promise<void> => {
    const result = await orderStore.index();
    expect(result).toEqual([activeOrder, completeOrder]);
  });

  it('addProduct method should add a product to order', async (): Promise<void> => {
    orderProduct.orderId = activeOrder.id as number;
    const result = await orderStore.addProduct(orderProduct);
    orderProduct.id = result.id;

    expect(result).toEqual(orderProduct);
  });

  it('addProduct method should throw and error if order is complete', async (): Promise<void> => {
    orderProduct.orderId = completeOrder.id as number;

    await expectAsync(
      orderStore.addProduct(orderProduct)
    ).toBeRejectedWithError();
  });

  it('removeProduct method should remove a product from order', async (): Promise<void> => {
    await expectAsync(
      orderStore.removeProduct(activeOrder.id as number, product.id as number)
    ).toBeResolvedTo(true);
    await expectAsync(orderStore.removeProduct(1000, 1000)).toBeResolvedTo(
      false
    );
  });

  it('delete method should delete the correct order', async () => {
    await expectAsync(
      orderStore.delete(activeOrder.id as number)
    ).toBeResolvedTo(true);
    await expectAsync(
      orderStore.delete(completeOrder.id as number)
    ).toBeResolvedTo(true);
    await expectAsync(orderStore.delete(1000)).toBeResolvedTo(false);
    expect(await orderStore.index()).toEqual([]);
  });
});
