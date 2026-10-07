import TryCatch from "../middlewares/tryCatch.js";
import { CourseService } from "../services/courseService.js";
import { PaymentService } from "../services/paymentService.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const result = await CourseService.getAllCourses();
  res.json(result);
});

export const getSingleCourse = TryCatch(async (req, res) => {
  try {
    const result = await CourseService.getSingleCourse(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const fetchLectures = TryCatch(async (req, res) => {
  try {
    const result = await CourseService.fetchLectures(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const fetchLecture = TryCatch(async (req, res) => {
  try {
    const result = await CourseService.fetchLecture(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const getMyCourses = TryCatch(async (req, res) => {
  const result = await CourseService.getMyCourses(req.user._id);
  res.json(result);
});

export const checkOut = TryCatch(async (req, res) => {
  try {
    const result = await PaymentService.checkOut(req.user._id, req.params.id);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const paymentVerification = TryCatch(async (req, res) => {
  try {
    const result = await PaymentService.paymentVerification(req.user._id, req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});
