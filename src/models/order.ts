import Client from '../database';

export enum OrderStatus {
  ACTIVE = 'active',
  COMPLETE = 'complete',
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
}

export interface OrderProduct {
  id?: number;
  order_id: number;
  product_id: number;
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
        return { ...order, user_id: parseInt(order.user_id) };
      });
    } catch (error) {
      throw new Error(`Could not get the orders. Error: ${error}`);
    }
  }

  async show(id: number): Promise<Order> {
    try {
      const conn = await Client.connect();
      const sql = 'SELECT * FROM orders WHERE id=$1';
      const result = await conn.query(sql, [id]);
      conn.release();
      if (!result.rows[0]) throw new Error('The order id was not found.');
      return { ...result.rows[0], user_id: parseInt(result.rows[0].user_id) };
    } catch (error) {
      throw new Error(`Could not get order ${id}. Error: ${error}`);
    }
  }

  async create(order: Order): Promise<Order> {
    try {
      const conn = await Client.connect();
      const sql =
        'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *';
      const result = await conn.query(sql, [order.user_id, order.status]);
      conn.release();
      return { ...result.rows[0], user_id: parseInt(result.rows[0].user_id) };
    } catch (error) {
      throw new Error(`Could not add new order. Error: ${error}`);
    }
  }

  async addProduct(orderProduct: OrderProduct): Promise<OrderProduct> {
    try {
      const conn = await Client.connect();
      const sql1 = 'SELECT status from orders WHERE id=$1';
      const result1 = await conn.query(sql1, [orderProduct.order_id]);
      const order = result1.rows[0];

      if (!order) throw new Error('The order was not found.');

      if (order?.status && order.status !== OrderStatus.ACTIVE) {
        throw new Error(`The order status is ${order.status}`);
      }

      const sql2 =
        'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
      const result2 = await conn.query(sql2, [
        orderProduct.order_id,
        orderProduct.product_id,
        orderProduct.quantity,
      ]);
      conn.release();
      return {
        ...result2.rows[0],
        order_id: parseInt(result2.rows[0].order_id),
        product_id: parseInt(result2.rows[0].product_id),
      };
    } catch (error) {
      throw new Error(
        `Couldn't add product ${orderProduct.product_id} to order ${orderProduct.order_id}. Error: ${error}`
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
    } catch (error) {
      throw new Error(
        `Couldn't remove product ${productId} from ${orderId}. Error: ${error}`
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
    } catch (error) {
      throw new Error(`Could not delete order ${id}. ${error}`);
    }
  }
}
