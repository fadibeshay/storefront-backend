import Client from '../database';
import { Product } from '../models/product';

export class DashboardQueries {
  // Get current order by user id
  async CurrentOrderByUser(userId: number): Promise<{
    id: number;
    userId: number;
    status: string;
    products: Product[];
  }> {
    try {
      const conn = await Client.connect();

      // Get active order for this user
      const sql1 = 'SELECT * FROM orders WHERE user_id=$1 AND status=$2';
      const result1 = await conn.query(sql1, [userId, 'active']);
      if (!result1.rowCount) throw new Error('There is no active order.');
      const order = {
        id: result1.rows[0].id,
        userId: parseInt(result1.rows[0].user_id),
        status: result1.rows[0].status,
      };

      // Get the order's products
      const sql2 = `SELECT products.id, products.name, products.price, products.category
                    FROM products
                    INNER JOIN order_products
                    ON products.id = order_products.product_id
                    WHERE order_products.order_id = $1`;
      const result2 = await conn.query(sql2, [order.id]);

      conn.release();

      return {
        ...order,
        products: result2.rows.map((product) => {
          return { ...product, price: parseFloat(product.price) };
        }),
      };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(
        `Could not get current order for user ${userId}. ${message}`
      );
    }
  }
}
