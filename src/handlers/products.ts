import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import { protect, admin } from '../middlewares/auth';

const productStore = new ProductStore();

const index = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productStore.index();
    res.status(200).json(products);
    return;
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(500).json({ error: message });
    return;
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'The id should be a number.' });
    return;
  }
  try {
    const product = await productStore.show(id);
    res.status(200).json(product);
    return;
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(404).json({ error: message });
    return;
  }
};

const create = async (req: Request, res: Response): Promise<void> => {
  const product: Product = {
    name: req.body.name,
    price: parseFloat(req.body.price),
    category: req.body.category,
  };

  const errMsg: string[] = [];
  if (!product.name || product.name?.length <= 0)
    errMsg.push('name is required');
  if (isNaN(product.price))
    errMsg.push('price is required and should be a valid number');
  if (!product.category || product.category?.length <= 0)
    errMsg.push('category is required');

  if (errMsg.length > 0) {
    res.status(400).json({
      error: errMsg.join(', '),
    });
    return;
  }

  product.price = parseFloat(product.price.toFixed(2));
  try {
    const newProduct = await productStore.create(product);
    res.status(200).json(newProduct);
    return;
  } catch (error: unknown) {
    const { message } = error as Error;
    res.json({ error: message });
    return;
  }
};

const productsRoutes = (app: express.Application) => {
  app.get('/products', index);
  app.get('/products/:id', show);
  app.post('/products', [protect, admin], create);
};

export default productsRoutes;
