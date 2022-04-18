import Client from '../database';

export interface Product {
  id?: number;
  name: string;
  price: number;
  category?: string;
}

export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM products';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (error) {
      throw new Error(`Couldn't get the products. ${error}`);
    }
  }

  async show(id: number): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM products WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Couldn't get product ${id}. ${error}`);
    }
  }

  async create(product: Product): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql =
        'INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [
        product.name,
        product.price,
        product.category || null,
      ]);
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Couldn't add new product ${product.name}. ${error}`);
    }
  }

  async update(id: number, product: Product): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql =
        'UPDATE products SET name=$1, price=$2, category=$3 WHERE id = $4 RETURNING *';
      const result = await conn.query(sql, [
        product.name,
        product.price,
        product.category || null,
        id,
      ]);
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Couldn't update product ${id}. ${error}`);
    }
  }

  async delete(id: number): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql = 'DELETE FROM products WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(`Couldn't delete product ${id}. ${error}`);
    }
  }
}
