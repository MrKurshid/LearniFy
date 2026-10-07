import { pool } from "../database/db.js";

const mapCourse = (row) => {
  if (!row) return null;
  const course = { ...row, _id: row.id, createdBy: row.created_by, createdAt: row.created_at };
  delete course.id;
  delete course.created_by;
  delete course.created_at;
  return course;
};

export const CourseRepository = {
  async findAll() {
    const result = await pool.query("SELECT * FROM courses");
    return result.rows.map(mapCourse);
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    return mapCourse(result.rows[0]);
  },

  async findSubscribedCourses(userId) {
    const query = `
      SELECT c.* 
      FROM courses c
      JOIN subscriptions s ON c.id = s.course_id
      WHERE s.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(mapCourse);
  },

  async create(courseData) {
    const { title, description, category, createdBy, duration, price, image } = courseData;
    const result = await pool.query(
      `INSERT INTO courses (title, description, category, created_by, duration, price, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, category, createdBy, duration, price, image]
    );
    return mapCourse(result.rows[0]);
  },

  async delete(id) {
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
  }
};
