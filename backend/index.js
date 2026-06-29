// backend/index.js

import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import statusRoutes from "./routes/statusRoutes.js";

// socket setup
import { app, server } from "./socket/socket.js";

// config env
dotenv.config();

// constants
const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

// -------------------- MIDDLEWARE --------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend/uploads"))
);

const allowedOrigins = [
  "http://localhost:3000",
  "https://chat-app23.onrender.com",
  " http://172.19.101.243:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// IMPORTANT: handle preflight
app.options("*", cors());


// -------------------- ROUTES --------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/status", statusRoutes);

// -------------------- FRONTEND (OPTIONAL) --------------------
// Only serve frontend IF build exists (production safety)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend", "build");

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// -------------------- SERVER START --------------------
server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`✅ Server running on port ${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
});
