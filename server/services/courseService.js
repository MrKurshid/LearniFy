import { CourseRepository } from "../repositories/courseRepository.js";
import { LectureRepository } from "../repositories/lectureRepository.js";
import { EnrollmentRepository } from "../repositories/enrollmentRepository.js";
import { getAuthenticatedVideoUrl } from "../utils/cloudinary.js";

const serializeLecture = (lecture) => {
  const result = { ...lecture };
  if (result.videoPublicId) {
    result.video = getAuthenticatedVideoUrl(result.videoPublicId);
  }
  return result;
};

export const CourseService = {
  async getAllCourses() {
    const courses = await CourseRepository.findAll();
    return { courses };
  },

  async getSingleCourse(id) {
    const course = await CourseRepository.findById(id);
    if (!course) throw { status: 404, message: "Course not found" };
    return { course };
  },

  async fetchLectures(courseId, user) {
    const lectures = await LectureRepository.findByCourseId(courseId);
    
    if (user.role === "admin") {
      return { lectures: lectures.map(serializeLecture) };
    }

    const isEnrolled = await EnrollmentRepository.isEnrolled(user._id, courseId);
    if (!isEnrolled) {
      throw { status: 400, message: "You have not subscribed to this course" };
    }

    return { lectures: lectures.map(serializeLecture) };
  },

  async fetchLecture(lectureId, user) {
    const lecture = await LectureRepository.findById(lectureId);
    if (!lecture) throw { status: 404, message: "Lecture not found" };

    if (user.role === "admin") {
      return { lecture: serializeLecture(lecture) };
    }

    const isEnrolled = await EnrollmentRepository.isEnrolled(user._id, lecture.course);
    if (!isEnrolled) {
      throw { status: 400, message: "You have not subscribed to this course" };
    }

    return { lecture: serializeLecture(lecture) };
  },

  async getMyCourses(userId) {
    const courses = await CourseRepository.findSubscribedCourses(userId);
    return { courses };
  }
};
