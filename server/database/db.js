import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isConnected = false;

export const connectDb = async () => {
  if (isConnected) return;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured in .env");
    }
    const client = await pool.connect();
    client.release();
    isConnected = true;
    console.log("PostgreSQL Database Connected Successfully");
  } catch (error) {
    console.error("[Database Connection Error]:", error.message);
    throw error;
  }
};
