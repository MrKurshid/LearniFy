import { CourseRepository } from "../repositories/courseRepository.js";
import { LectureRepository } from "../repositories/lectureRepository.js";
import { AdminRepository } from "../repositories/adminRepository.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const AdminService = {
  async createCourse(courseData, imageFile) {
    if (!imageFile) {
      throw { status: 400, message: "Course thumbnail image is required" };
    }

    const cloudResult = await uploadToCloudinary(imageFile.path, "Learnify/courses");

    await CourseRepository.create({
      ...courseData,
      image: cloudResult.url
    });

    return { message: "course created successfully" };
  },

  async addLecture(courseId, lectureData, videoFile) {
    const course = await CourseRepository.findById(courseId);
    if (!course) {
      throw { status: 404, message: "No course with this id" };
    }

    if (!videoFile) {
      throw { status: 400, message: "Lecture video file is required" };
    }

    const cloudResult = await uploadToCloudinary(videoFile.path, "Learnify/lectures", {
      resource_type: "video",
      type: "authenticated",
    });

    const lecture = await LectureRepository.create({
      ...lectureData,
      video: cloudResult.url,
      videoPublicId: cloudResult.public_id,
      course: courseId
    });

    return { message: "Lecture added", lecture };
  },

  async deleteLecture(lectureId) {
    const lecture = await LectureRepository.findById(lectureId);
    if (lecture) {
      await deleteFromCloudinary(lecture.videoPublicId || lecture.video);
      await LectureRepository.delete(lectureId);
    }
    return { message: "Lecture deleted" };
  },

  async deleteCourse(courseId) {
    const course = await CourseRepository.findById(courseId);
    if (!course) {
      throw { status: 404, message: "Course not found" };
    }

    const lectures = await LectureRepository.findByCourseId(courseId);

    // Delete all lecture videos from Cloudinary
    await Promise.all(
      lectures.map(async (lecture) => {
        await deleteFromCloudinary(lecture.videoPublicId || lecture.video);
      })
    );

    // Delete course image from Cloudinary
    await deleteFromCloudinary(course.image);

    // Due to ON DELETE CASCADE on foreign keys in PostgreSQL,
    // deleting the course automatically deletes associated lectures, payments, and enrollments.
    await CourseRepository.delete(courseId);

    return { message: "Course deleted" };
  },

  async getAllStats() {
    const stats = await AdminRepository.getStats();
    return { stats };
  }
};
