import { pool } from "../database/db.js";

const mapUser = (row) => {
  if (!row) return null;
  const user = { ...row, _id: row.id, createdAt: row.created_at, updatedAt: row.updated_at };
  delete user.id;
  delete user.created_at;
  delete user.updated_at;
  delete user.password;
  return user;
};

const mapPayment = (row) => {
  if (!row) return null;
  const payment = { ...row, _id: row.id, createdAt: row.created_at, updatedAt: row.updated_at, user: row.user_id, course: row.course_id };
  delete payment.id;
  delete payment.created_at;
  delete payment.updated_at;
  delete payment.user_id;
  delete payment.course_id;
  return payment;
};

export const AdminRepository = {
  async getStats() {
    // Efficient COUNT aggregations instead of fetching all records
    const courseCount = await pool.query("SELECT COUNT(*) FROM courses");
    const lectureCount = await pool.query("SELECT COUNT(*) FROM lectures");
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    
    const usersResult = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    const paymentsResult = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");

    return {
      totalCourses: parseInt(courseCount.rows[0].count),
      totalLectures: parseInt(lectureCount.rows[0].count),
      totalUsers: parseInt(userCount.rows[0].count),
      users: usersResult.rows.map(mapUser),
      payments: paymentsResult.rows.map(mapPayment)
    };
  }
};
