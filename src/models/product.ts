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
      return result.rows.map((product) => {
        return { ...product, price: parseFloat(product.price) };
      });
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not get the products. ${message}`);
    }
  }

  async show(id: number): Promise<Product> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM products WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();
      if (!result.rows[0]) throw new Error('Product id is incorrect.');
      return { ...result.rows[0], price: parseFloat(result.rows[0].price) };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not get product ${id}. ${message}`);
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
      return { ...result.rows[0], price: parseFloat(result.rows[0].price) };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not add new product ${product.name}. ${message}`);
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
      if (!result.rows[0]) throw new Error('Product id is incorrect.');
      return { ...result.rows[0], price: parseFloat(result.rows[0].price) };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not update product ${id}. ${message}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = 'DELETE FROM products WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rowCount ? true : false;
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not delete product ${id}. ${message}`);
    }
  }
}
