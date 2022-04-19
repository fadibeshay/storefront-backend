import { Product, ProductStore } from '../../models/product';

const store = new ProductStore();

describe('Tests for product model', (): void => {
  it('should have an index method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', (): void => {
    expect(store.create).toBeDefined();
  });

  it('should have a update method', (): void => {
    expect(store.update).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(store.delete).toBeDefined();
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
    product.id = result.id;
    expect(result).toEqual(product);
  });

  it('index method should return a list of products', async () => {
    const result = await store.index();
    expect(result).toEqual([product]);
  });

  it('show method should return the correct product', async () => {
    const result = await store.show(product.id as number);
    expect(result).toEqual(product);
  });

  it('show method should throw an error if id is not found', async () => {
    await expectAsync(store.show(1000)).toBeRejectedWithError();
  });

  it('update method should update and return the correct product', async () => {
    const result = await store.update(product.id as number, updatedProduct);
    updatedProduct.id = product.id;
    expect(result).toEqual(updatedProduct);
  });

  it('update method should throw an error if id is not found', async () => {
    await expectAsync(
      store.update(1000, updatedProduct)
    ).toBeRejectedWithError();
  });

  it('delete method should delete the correct product', async () => {
    await expectAsync(store.delete(product.id as number)).toBeResolvedTo(true);
    await expectAsync(store.delete(1000)).toBeResolvedTo(false);
    expect(await store.index()).toEqual([]);
  });
});
