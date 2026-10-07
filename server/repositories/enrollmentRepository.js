import { pool } from "../database/db.js";

export const EnrollmentRepository = {
  async isEnrolled(userId, courseId) {
    const result = await pool.query(
      "SELECT 1 FROM subscriptions WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );
    return result.rows.length > 0;
  },

  async enroll(userId, courseId, client = pool) {
    await client.query(
      `INSERT INTO subscriptions (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, courseId]
    );
  }
};
