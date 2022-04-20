import express, { Request, Response } from 'express';
import { DashboardQueries } from '../services/dashboard';
import { protect, admin } from '../middlewares/auth';

const dashboardQueries = new DashboardQueries();

const currentOrderByUser = async (req: Request, res: Response) => {
  try {
    const currentOrder = await dashboardQueries.CurrentOrderByUser(
      req.body.user.id
    );
    res.status(200).json(currentOrder);
    return;
  } catch (error) {
    const { message } = error as Error;
    res.status(400).json({ Error: message });
    return;
  }
};

const dashboardRoutes = (app: express.Application): void => {
  app.get('/current_order', protect, currentOrderByUser);
};

export default dashboardRoutes;
