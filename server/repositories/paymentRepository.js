import { pool } from "../database/db.js";

export const PaymentRepository = {
  async create(paymentData, client = pool) {
    const { razorpay_order_id, user_id, course_id, amount, currency } = paymentData;
    const result = await client.query(
      `INSERT INTO payments (razorpay_order_id, user_id, course_id, amount, currency)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [razorpay_order_id, user_id, course_id, amount, currency]
    );
    return result.rows[0];
  },

  async findByOrderIdAndUserAndCourse(orderId, userId, courseId) {
    const result = await pool.query(
      "SELECT * FROM payments WHERE razorpay_order_id = $1 AND user_id = $2 AND course_id = $3",
      [orderId, userId, courseId]
    );
    return result.rows[0];
  },

  async markAsPaid(paymentId, razorpay_payment_id, razorpay_signature, client = pool) {
    const result = await client.query(
      `UPDATE payments 
       SET status = 'paid', razorpay_payment_id = $1, razorpay_signature = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND status = 'created' RETURNING *`,
      [razorpay_payment_id, razorpay_signature, paymentId]
    );
    return result.rows[0];
  }
};
