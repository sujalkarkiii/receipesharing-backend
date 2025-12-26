import express from "express";
import dotenv from "dotenv";
import connectdb from "./database/database_connection.js";
import routing from "./route/routing.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";

dotenv.config();
const app = express();

// CORS for both local and production
const allowedOrigins = [
  "http://localhost:5173",
  "https://sujalkarkiii-receipesharing-fronten.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/", routing);

// Database connection caching for serverless
let isConnected = false;

async function dbConnect() {
  if (isConnected) return;
  await connectdb();
  isConnected = true;
}

// Vercel serverless handler
const handler = serverless(app);

export default async function (req, res) {
  try {
    await dbConnect();
    return handler(req, res);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    res.status(500).json({ error: "DB connection failed" });
  }
}
