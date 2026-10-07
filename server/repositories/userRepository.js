import { pool } from "../database/db.js";

// Maps Postgres row to Mongoose-like object for the frontend
const mapToMongooseFormat = (row) => {
  if (!row) return null;
  const user = {
    ...row,
    _id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  delete user.id;
  delete user.created_at;
  delete user.updated_at;
  return user;
};

export const UserRepository = {
  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return mapToMongooseFormat(result.rows[0]);
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = mapToMongooseFormat(result.rows[0]);
    if (user) {
      // Fetch subscriptions
      const subResult = await pool.query(
        "SELECT course_id FROM subscriptions WHERE user_id = $1",
        [id]
      );
      user.subscription = subResult.rows.map((row) => row.course_id);
    }
    return user;
  },

  async create(userData) {
    const { name, email, password, role = "user" } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, password, role]
    );
    const user = mapToMongooseFormat(result.rows[0]);
    user.subscription = [];
    return user;
  },
};
