import TryCatch from "../middlewares/tryCatch.js";
import { AuthService } from "../services/authService.js";

export const register = TryCatch(async (req, res) => {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    throw error; // Let tryCatch handle standard 500s
  }
});

export const verifyUser = TryCatch(async (req, res) => {
  try {
    const result = await AuthService.verifyUser(req.body);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    throw error;
  }
});

export const loginUser = TryCatch(async (req, res) => {
  try {
    const result = await AuthService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    throw error;
  }
});

export const myProfile = TryCatch(async (req, res) => {
  try {
    const result = await AuthService.getMyProfile(req.user._id);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    throw error;
  }
});
