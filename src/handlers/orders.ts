import express, { Request, Response } from 'express';
import { Order, OrderStore, OrderStatus } from '../models/order';
import { protect, admin } from '../middlewares/auth';

const orderStore = new OrderStore();

const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newOrder = await orderStore.create({
      userId: req.body.user.id,
      status: OrderStatus.ACTIVE,
    });
    res.status(200).json(newOrder);
    return;
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(500).json({ error: message });
    return;
  }
};

const addProduct = async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.id);
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity);

  const errorMsg: string[] = [];

  if (isNaN(orderId)) {
    errorMsg.push('The order id should be a number.');
  }
  if (isNaN(productId)) {
    errorMsg.push('The product id should be a number.');
  }
  if (isNaN(quantity) || quantity <= 0) {
    errorMsg.push('The quantity should be a positive number.');
  }
  if (errorMsg.length > 0) {
    res.status(400).json({ Error: errorMsg.join(' ') });
    return;
  }
  try {
    const order = await orderStore.show(orderId);

    if (order.userId !== req.body.user.id) {
      res.status(401).json({ Error: 'Not authorized to modify this order.' });
      return;
    }

    const result = await orderStore.addProduct({
      orderId,
      productId,
      quantity,
    });
    res.status(200).json(result);
    return;
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(400).json({ Error: message });
    return;
  }
};

const orderRoutes = (app: express.Application) => {
  app.post('/orders', protect, create);
  app.post('/orders/:id/products', protect, addProduct);
};

export default orderRoutes;
