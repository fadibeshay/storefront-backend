import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import usersRoutes from './handlers/users';
import productsRoutes from './handlers/products';
import orderRoutes from './handlers/orders';
import dashboardRoutes from './handlers/dashboard';

const app: express.Application = express();
const address: string = 'http://localhost:3000/';

app.use(bodyParser.json());

dotenv.config();

app.get('/', (_req: Request, res: Response): void => {
  res.send('Hello World!');
});

usersRoutes(app);
productsRoutes(app);
orderRoutes(app);
dashboardRoutes(app);

app.listen(3000, (): void => {
  console.log(`starting app on: ${address}`);
});

export default app;
