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
  firstname: string;
  lastname: string;
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

      return result.rows;
    } catch (error) {
      throw new Error(`Could not get the users. ${error}`);
    }
  }

  async show(id: number): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM users WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      if (!result.rows[0]) throw new Error('The user id was not found.');
      return result.rows[0];
    } catch (error) {
      throw new Error(`Could not get user ${id}. ${error}`);
    }
  }

  async create(user: User): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql =
        'INSERT INTO users (username, firstname, lastname, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING *';

      const hash = await bcrypt.hash(
        user.password + BCRYPT_PASSWORD,
        parseInt(SALT_ROUNDS as string)
      );
      const result = await conn.query(sql, [
        user.username,
        user.firstname,
        user.lastname,
        user.role || UserRole.USER,
        hash,
      ]);
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Could not add new user ${user.username}. ${error}`);
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

      const user: User = result.rows[0] as User;
      if (await bcrypt.compare(password + BCRYPT_PASSWORD, user.password)) {
        return user;
      } else {
        throw new Error('The username/password is incorrect.');
      }
    } catch (error) {
      throw new Error(`Could not authenticate user ${username}. ${error}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = 'DELETE FROM users WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rowCount ? true : false;
    } catch (error) {
      throw new Error(`Could not delete user ${id}. ${error}`);
    }
  }
}
