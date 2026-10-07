import { CourseRepository } from "../repositories/courseRepository.js";
import { EnrollmentRepository } from "../repositories/enrollmentRepository.js";
import { PaymentRepository } from "../repositories/paymentRepository.js";
import { instance } from "../index.js";
import crypto from "crypto";
import { pool } from "../database/db.js";

export const PaymentService = {
  async checkOut(userId, courseId) {
    console.log(`[Backend Checkout] User: ${userId}, Course: ${courseId}`);
    
    const course = await CourseRepository.findById(courseId);
    if (!course) {
      console.log(`[Backend Checkout Error] Course not found: ${courseId}`);
      throw { status: 404, message: "Course not found" };
    }

    const isEnrolled = await EnrollmentRepository.isEnrolled(userId, courseId);
    if (isEnrolled) {
      console.log(`[Backend Checkout Info] User already subscribed to course ${courseId}`);
      throw { status: 400, message: "You have already purchased this course" };
    }

    if (!process.env.Razorpay_key || !process.env.Razorpay_Secret) {
      throw { status: 503, message: "Payments are not configured" };
    }

    const amount = Math.round(Number(course.price) * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw { status: 400, message: "Course has an invalid price" };
    }

    const order = await instance.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: userId.toString(), courseId: course._id.toString() },
    });

    await PaymentRepository.create({
      razorpay_order_id: order.id,
      user_id: userId,
      course_id: course._id,
      amount: course.price,
      currency: order.currency,
    });

    return { order, course };
  },

  async paymentVerification(userId, courseId, paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw { status: 400, message: "Incomplete payment details" };
    }

    const payment = await PaymentRepository.findByOrderIdAndUserAndCourse(
      razorpay_order_id, userId, courseId
    );

    if (!payment || payment.status !== "created") {
      throw { status: 400, message: "Payment order is invalid or already processed" };
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.Razorpay_Secret)
      .update(body)
      .digest("hex");
      
    const isAuthentic =
      razorpay_signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isAuthentic) {
      throw { status: 400, message: "Payment verification failed" };
    }

    const course = await CourseRepository.findById(courseId);
    if (!course) {
      throw { status: 404, message: "Course not found" };
    }

    // Use a Transaction to ensure atomic update of payment and enrollment
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const completedPayment = await PaymentRepository.markAsPaid(
        payment.id, razorpay_payment_id, razorpay_signature, client
      );

      if (!completedPayment) {
        throw { status: 400, message: "Payment order is already processed" };
      }

      await EnrollmentRepository.enroll(userId, courseId, client);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return { message: "Course purchased successfully" };
  }
};
