import Client from '../database';

export enum OrderStatus {
  ACTIVE = 'active',
  COMPLETE = 'complete',
}

export interface Order {
  id?: number;
  userId: number;
  status: OrderStatus;
}

export interface OrderProduct {
  id?: number;
  orderId: number;
  productId: number;
  quantity: number;
}

export class OrderStore {
  async index(): Promise<Order[]> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM orders';
      const result = await conn.query(sql);
      conn.release();
      return result.rows.map((order): Order => {
        return {
          id: order.id,
          userId: parseInt(order.user_id),
          status: order.status,
        };
      });
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not get the orders. ${message}`);
    }
  }

  async show(id: number): Promise<Order> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM orders WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      if (!result.rows[0]) throw new Error('The order id was not found.');
      return {
        id: result.rows[0].id,
        userId: parseInt(result.rows[0].user_id),
        status: result.rows[0].status,
      };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not get order ${id}. ${message}`);
    }
  }

  async create(order: Order): Promise<Order> {
    try {
      const conn = await Client.connect();
      const sql =
        'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *';
      const result = await conn.query(sql, [order.userId, order.status]);
      conn.release();
      return {
        id: result.rows[0].id,
        userId: parseInt(result.rows[0].user_id),
        status: result.rows[0].status,
      };
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not add new order. ${message}`);
    }
  }

  async addProduct(orderProduct: OrderProduct): Promise<OrderProduct> {
    try {
      // Check if order exists
      const conn = await Client.connect();
      const sql1 = 'SELECT status from orders WHERE id=$1';
      const result1 = await conn.query(sql1, [orderProduct.orderId]);
      const order = result1.rows[0];
      if (!order) throw new Error('The order was not found.');
      if (order?.status && order.status !== OrderStatus.ACTIVE) {
        throw new Error(`The order status is ${order.status}`);
      }

      // Check if product exists
      const sql2 = 'SELECT id from products WHERE id=$1';
      const result2 = await conn.query(sql2, [orderProduct.productId]);
      const product = result2.rows[0];
      if (!product) throw new Error('The product was not found.');

      // Add the product to order
      const sql3 =
        'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
      const result3 = await conn.query(sql3, [
        orderProduct.orderId,
        orderProduct.productId,
        orderProduct.quantity,
      ]);
      conn.release();
      return {
        id: result3.rows[0].id,
        orderId: parseInt(result3.rows[0].order_id),
        productId: parseInt(result3.rows[0].product_id),
        quantity: result3.rows[0].quantity,
      };
    } catch (error) {
      const { message } = error as Error;
      throw new Error(
        `Could not add product ${orderProduct.productId} to order ${orderProduct.orderId}. ${message}`
      );
    }
  }

  async removeProduct(orderId: number, productId: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql1 = 'SELECT status from orders WHERE id=$1';
      const result1 = await conn.query(sql1, [orderId]);
      const order = result1.rows[0];

      if (!order) return false;

      if (order?.status && order.status !== OrderStatus.ACTIVE) {
        throw new Error(`The order status is ${order.status}`);
      }

      const sql =
        'DELETE FROM order_products WHERE order_id=$1 AND product_id=$2';
      const result = await conn.query(sql, [orderId, productId]);
      conn.release();
      return result.rowCount ? true : false;
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(
        `Could not remove product ${productId} from ${orderId}. ${message}`
      );
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const conn = await Client.connect();
      const sql = 'DELETE FROM orders WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rowCount ? true : false;
    } catch (error: unknown) {
      const { message } = error as Error;
      throw new Error(`Could not delete order ${id}. ${message}`);
    }
  }
}
