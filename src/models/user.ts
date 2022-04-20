import bcrypt from 'bcrypt';
import Client from '../database';

const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  password: string;
}

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM users';
      const result = await conn.query(sql);
      conn.release();

      return result.rows.map((user) => {
        return {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          password: user.password,
        };
      });
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not get the users. ${message}`);
    }
  }

  async show(id: number): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM users WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      if (!result.rows[0]) throw new Error('The user id was not found.');
      return {
        id: result.rows[0].id,
        username: result.rows[0].username,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        role: result.rows[0].role,
        password: result.rows[0].password,
      };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not get user ${id}. ${message}`);
    }
  }

  async create(user: User): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql1 = 'SELECT id from users WHERE username=$1';
      const result1 = await conn.query(sql1, [user.username]);
      if (result1.rowCount > 0) {
        throw new Error(`The username ${user.username} is already taken.`);
      }

      const sql =
        'INSERT INTO users (username, first_name, last_name, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING *';

      const hash = await bcrypt.hash(
        user.password + BCRYPT_PASSWORD,
        parseInt(SALT_ROUNDS as string)
      );
      const result = await conn.query(sql, [
        user.username,
        user.firstName,
        user.lastName,
        user.role || UserRole.USER,
        hash,
      ]);
      conn.release();
      return {
        id: result.rows[0].id,
        username: result.rows[0].username,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        role: result.rows[0].role,
        password: result.rows[0].password,
      };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not add new user ${user.username}. ${message}`);
    }
  }

  async authenticate(username: string, password: string): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM users WHERE username = $1';
      const result = await conn.query(sql, [username]);
      conn.release();
      if (!result.rows[0])
        throw new Error('The username/password is incorrect.');

      const user = result.rows[0];
      if (await bcrypt.compare(password + BCRYPT_PASSWORD, user.password)) {
        return {
          id: result.rows[0].id,
          username: result.rows[0].username,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          role: result.rows[0].role,
          password: result.rows[0].password,
        };
      } else {
        throw new Error('The username/password is incorrect.');
      }
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not authenticate user ${username}. ${message}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = 'DELETE FROM users WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rowCount ? true : false;
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not delete user ${id}. ${message}`);
    }
  }
}
