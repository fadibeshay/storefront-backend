import { Product, ProductStore } from '../../models/product';

const store = new ProductStore();

describe('Tests for product model', (): void => {
  it('should have an index method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a create method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a update method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(store.index).toBeDefined();
  });

  const product: Product = {
    id: 1,
    name: 'test product',
    price: 10,
    category: 'test category',
  };
  const updatedProduct = { ...product, name: 'updated product' };

  it('create method should add a new product', async (): Promise<void> => {
    const result = await store.create(product);

    expect(result).toEqual(product);
  });

  it('index method should return a list of products', async () => {
    const result = await store.index();
    expect(result).toEqual([product]);
  });

  it('show method should return the correct product', async () => {
    const result = await store.show(1);
    expect(result).toEqual(product);
  });

  it('show method should throw an error if id is not found', async () => {
    await expectAsync(store.show(2)).toBeRejectedWithError();
  });

  it('update method should update and return the correct product', async () => {
    const result = await store.update(1, updatedProduct);
    expect(result).toEqual(updatedProduct);
  });

  it('update method should throw an error if id is not found', async () => {
    await expectAsync(store.update(2, updatedProduct)).toBeRejectedWithError();
  });

  it('delete method should delete the correct product', async () => {
    await store.delete(1);
    expect(await store.index()).toEqual([]);
  });
});
