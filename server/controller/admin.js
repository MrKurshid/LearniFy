import TryCatch from "../middlewares/tryCatch.js";
import { AdminService } from "../services/adminService.js";

export const createCourse = TryCatch(async (req, res) => {
  try {
    const result = await AdminService.createCourse(req.body, req.file);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const addLecture = TryCatch(async (req, res) => {
  try {
    const result = await AdminService.addLecture(req.params.id, req.body, req.file);
    res.status(202).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const deleteLecture = TryCatch(async (req, res) => {
  try {
    const result = await AdminService.deleteLecture(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const deleteCourse = TryCatch(async (req, res) => {
  try {
    const result = await AdminService.deleteCourse(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});

export const getAllStats = TryCatch(async (req, res) => {
  try {
    const result = await AdminService.getAllStats();
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    throw error;
  }
});
