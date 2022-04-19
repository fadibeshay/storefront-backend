import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserStore } from '../models/user';
import { protect } from '../middlewares/auth';

const store = new UserStore();

const index = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await store.index();
    res.status(200).json(users);
  } catch (error) {
    res.json({ error: `${error}` });
  }
};

const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await store.show(parseInt(req.params.id));
    res.status(200).json(user);
  } catch (error) {
    res.json({ error: `${error}` });
  }
};

const create = async (req: Request, res: Response): Promise<void> => {
  const user: User = {
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    password: req.body.password,
  };
  let errMsg: string[] = [];
  if (!user.username || user.username?.length <= 0)
    errMsg.push('username is required');
  if (!user.firstname || user.firstname?.length <= 0)
    errMsg.push('firstname is required');
  if (!user.lastname || user.lastname?.length <= 0)
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
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      token: token,
    });
  } catch (error) {
    res.json({ error: `${error}` });
  }
};

const authenticate = async (req: Request, res: Response): Promise<void> => {
  let errMsg: string[] = [];
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
    const token = jwt.sign({ user: user }, process.env.TOKEN_SECRET as string);
    res.json({
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      token: token,
    });
  } catch (error) {
    res.status(400).json({ error: `${error}` });
  }
};

const usersRoutes = (app: express.Application) => {
  app.get('/users', protect, index);
  app.get('/users/:id', protect, show);
  app.post('/users', create);
  app.post('/users/authenticate', authenticate);
};

export default usersRoutes;
