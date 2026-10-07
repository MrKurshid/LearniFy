import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(403).json({
        message: "Please Login",
      });
    }
    
    const decodedData = jwt.verify(token, process.env.Jwt_Sec);
    const user = await UserRepository.findById(decodedData._id);

    if (!user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }
    
    // Ensure password is not attached to the request object
    delete user.password;
    req.user = user;

    next();
  } catch (error) {
    res.status(403).json({
      message: "Please Login",
    });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "You are not an admin",
      });
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
