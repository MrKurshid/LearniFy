import { UserRepository } from "../repositories/userRepository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail from "../middlewares/sendmails.js";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

export const AuthService = {
  async registerUser({ name, email, password }) {
    if (!email || !name || !password) {
      throw { status: 400, message: "Please fill in all fields (name, email, password)" };
    }
    
    if (!process.env.Activation_Secret) {
      throw { status: 500, message: "Server configuration error: Activation_Secret environment variable is missing on server." };
    }
    if (!process.env.Gmail) {
      throw { status: 500, message: "Server configuration error: Gmail environment variable is missing on server." };
    }
    if (!process.env.Password) {
      throw { status: 500, message: "Server configuration error: Password (Google App Password) environment variable is missing on server." };
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw { status: 400, message: "User Already exists" };
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = { name, email, password: hashPassword };
    const otp = Math.floor(100000 + Math.random() * 900000);

    const activationToken = jwt.sign(
      { user, otp },
      process.env.Activation_Secret,
      { expiresIn: "5m" }
    );

    const data = { name: escapeHtml(name), otp };

    try {
      await sendMail(email, "E learning", data);
    } catch (mailErr) {
      console.error("[SMTP Error] Failed to send OTP email:", mailErr);
      throw { status: 500, message: `Failed to send OTP email: ${mailErr.message || "Connection timeout"}.` };
    }

    return { message: "Otp send to your mail", activationToken };
  },

  async verifyUser({ otp, activationToken }) {
    if (!activationToken) {
      throw { status: 400, message: "Activation token missing or expired. Please register again." };
    }
    if (!process.env.Activation_Secret) {
      throw { status: 500, message: "Server configuration error: Activation_Secret is missing on server." };
    }

    let verify;
    try {
      verify = jwt.verify(activationToken, process.env.Activation_Secret);
    } catch (err) {
      throw { status: 400, message: "OTP expired or invalid session. Please register again." };
    }

    if (!verify) throw { status: 400, message: "Otp Expired" };
    if (String(verify.otp) !== String(otp)) throw { status: 400, message: "Wrong Otp" };

    await UserRepository.create({
      name: verify.user.name,
      email: verify.user.email,
      password: verify.user.password,
    });

    return { message: "User Registered" };
  },

  async loginUser({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw { status: 400, message: "No User with this email" };

    const mathPassword = await bcrypt.compare(password, user.password);
    if (!mathPassword) throw { status: 400, message: "Wrong password" };

    const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
      expiresIn: "15d",
    });
    
    const userObj = { ...user };
    delete userObj.password;

    return {
      message: `welcome back ${user.name}`,
      token,
      user: userObj,
    };
  },

  async getMyProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw { status: 404, message: "User not found" };
    delete user.password;
    return { user };
  }
};
