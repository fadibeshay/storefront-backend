import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserStore } from '../models/user';
import { protect, admin } from '../middlewares/auth';

const store = new UserStore();

const index = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await store.index();
    const usersOut = users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    });
    res.status(200).json(usersOut);
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(500).json({ error: `${message}` });
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'The id should be a number.' });
  }
  try {
    const user = await store.show(id);
    res.status(200).json({
      id: user.id,
      username: user.username,
      firstname: user.firstName,
      lastname: user.lastName,
    });
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(400).json({ error: `${message}` });
  }
};

const create = async (req: Request, res: Response): Promise<void> => {
  const user: User = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  };
  const errMsg: string[] = [];
  if (!user.username || user.username?.length <= 0)
    errMsg.push('username is required');
  if (!user.firstName || user.firstName?.length <= 0)
    errMsg.push('firstname is required');
  if (!user.lastName || user.lastName?.length <= 0)
    errMsg.push('lastname is required');
  if (!user.password || user.password?.length <= 0)
    errMsg.push('password is required');

  if (errMsg.length > 0) {
    res.status(400).json({
      error: errMsg.join(', '),
    });
    return;
  }

  try {
    const newUser = await store.create(user);
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.TOKEN_SECRET as string
    );
    res.status(200).json({
      id: newUser.id,
      username: newUser.username,
      firstname: newUser.firstName,
      lastname: newUser.lastName,
      token: token,
    });
  } catch (error: unknown) {
    const { message } = error as Error;
    res.json({ error: `${message}` });
  }
};

const authenticate = async (req: Request, res: Response): Promise<void> => {
  const errMsg: string[] = [];
  if (!req.body.username || req.body.username?.length <= 0)
    errMsg.push('username is required');
  if (!req.body.password || req.body.password?.length <= 0)
    errMsg.push('password is required');

  if (errMsg.length > 0) {
    res.status(400).json({
      error: errMsg.join(', '),
    });
    return;
  }
  try {
    const user = await store.authenticate(req.body.username, req.body.password);
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.TOKEN_SECRET as string
    );
    res.json({
      id: user.id,
      username: user.username,
      firstname: user.firstName,
      lastname: user.lastName,
      token: token,
    });
  } catch (error: unknown) {
    const { message } = error as Error;
    res.status(400).json({ error: `${message}` });
  }
};

const usersRoutes = (app: express.Application) => {
  app.get('/users', protect, index);
  app.get('/users/:id', protect, show);
  app.post('/users', create);
  app.post('/users/authenticate', authenticate);
};

export default usersRoutes;
