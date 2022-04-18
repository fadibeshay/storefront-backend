import bcrypt from 'bcrypt';
import Client from '../database';

const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;

export interface User {
  id?: number;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
}

export class userStore {
  async create(user: User): Promise<User> {
    try {
      const conn = await Client.connect();
      const sql =
        'INSERT INTO users (username, firstname, lastname, password) VALUES ($1, $2, $3, $4) RETURNING *';

      const hash = await bcrypt.hash(
        user.password + BCRYPT_PASSWORD,
        parseInt(SALT_ROUNDS as string)
      );
      const result = await conn.query(sql, [
        user.username,
        user.firstname,
        user.lastname,
        hash,
      ]);
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Couldn't add new user ${user.username}. ${error}`);
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
      throw new Error(`Couldn't authenticate user ${username}. ${error}`);
    }
  }
}
