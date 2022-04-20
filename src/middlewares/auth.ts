import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserStore, User, UserRole } from '../models/user';

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
    let decoded;

    try {
      const token = req.headers.authorization.split(' ')[1];
      decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as {
        id: number;
        username: string;
      };
    } catch (error: unknown) {
      res.status(401).json({ error: 'Not authorized. Invalid token' });
      return;
    }

    try {
      const user: User = await userStore.show(decoded.id);
      req.body.user = user;
      next();
    } catch (error: unknown) {
      const { message } = error as Error;
      res.status(401).json({ error: `Not authorized. ${message}` });
      return;
    }
  } else {
    res.status(401).json({ error: 'Not authorized. Missing token.' });
    return;
  }
};

export const admin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.body.user && req.body.user?.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(401).json({ error: 'Not authorized as admin.' });
    return;
  }
};
