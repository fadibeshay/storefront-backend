import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserStore, User } from '../models/user';

const userStore = new UserStore();

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as {
        id: number;
        username: string;
      };
      const user: User = await userStore.show(decoded.id);
      req.body.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: `Not authorized. ${error}` });
    }
  } else {
    res.status(401).json({ error: 'Not authorized. Missing token.' });
  }
};
