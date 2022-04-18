import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app: express.Application = express();
const address: string = 'http://localhost:3000/';

app.use(bodyParser.json());

app.get('/', (_req: Request, res: Response): void => {
  res.send('Hello World!');
});

app.listen(3000, (): void => {
  console.log(`starting app on: ${address}`);
});
