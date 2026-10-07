import { pool } from "../database/db.js";

const mapLecture = (row) => {
  if (!row) return null;
  const lecture = { 
    ...row, 
    _id: row.id, 
    course: row.course_id,
    videoPublicId: row.video_public_id,
    createdAt: row.created_at 
  };
  delete lecture.id;
  delete lecture.course_id;
  delete lecture.video_public_id;
  delete lecture.created_at;
  return lecture;
};

export const LectureRepository = {
  async findByCourseId(courseId) {
    const result = await pool.query("SELECT * FROM lectures WHERE course_id = $1", [courseId]);
    return result.rows.map(mapLecture);
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM lectures WHERE id = $1", [id]);
    return mapLecture(result.rows[0]);
  },

  async create(lectureData) {
    const { title, description, video, videoPublicId, course } = lectureData;
    const result = await pool.query(
      `INSERT INTO lectures (title, description, video, video_public_id, course_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, video, videoPublicId, course]
    );
    return mapLecture(result.rows[0]);
  },

  async delete(id) {
    await pool.query("DELETE FROM lectures WHERE id = $1", [id]);
  },

  async deleteByCourseId(courseId) {
    await pool.query("DELETE FROM lectures WHERE course_id = $1", [courseId]);
  }
};
