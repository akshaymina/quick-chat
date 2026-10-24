// Must be the first import: loads .env before any other module is evaluated.
import "./config/env.js";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/database.js";
import { allowedOrigins } from "./config/origins.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import statusRoutes from "./routes/statusRoutes.js";
import { rescheduleAllPendingExpiries } from "./controllers/messageController.js";

// socket setup
import { app, server } from "./socket/socket.js";

const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

// -------------------- SECURITY MIDDLEWARE --------------------
app.use(
  helmet({
    // Uploaded files are loaded cross-origin by the frontend in dev.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Default CSP would block avatar images (external host) and media
    // when the built frontend is served by this server in production.
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:", "blob:", "https://avatar.iran.liara.run"],
        "media-src": ["'self'", "blob:"],
      },
    },
  })
);

// -------------------- CORS --------------------
// cors() also answers OPTIONS preflight requests by itself. The old extra
// `app.options("*", cors())` re-opened preflight to EVERY origin, defeating
// the allow-list, so it has been removed.
app.use(
  cors({
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
  })
);

// -------------------- BODY PARSERS --------------------
// These must run BEFORE the sanitizer below. Previously the sanitizer ran
// first, so req.body was still undefined and was never sanitized.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Strip Mongo operator keys ($gt, $ne, ...) and dotted keys from user input
// to block NoSQL injection.
const sanitizeValue = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) {
    const cleaned = sanitizeValue(req.query);
    for (const key of Object.keys(req.query)) {
      if (!(key in cleaned)) delete req.query[key];
    }
    Object.assign(req.query, cleaned);
  }
  next();
});

// Brute-force protection for credential endpoints ONLY. It used to wrap the
// whole /user router, so ordinary calls like "load contacts" burned the
// same 50-per-15-minutes budget and users got locked out of the sidebar.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later.", success: false },
});

// -------------------- STATIC UPLOADS --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- ROUTES --------------------
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/status", statusRoutes);

// Unknown API routes must 404 as JSON, not fall through to index.html.
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found", success: false });
});

// -------------------- FRONTEND (PRODUCTION) --------------------
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "frontend", "build");

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  if (err.message?.startsWith("CORS blocked origin")) {
    return res.status(403).json({ message: "Not allowed by CORS", success: false });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large (max 10MB)", success: false });
  }

  if (err.message?.startsWith("Unsupported file type")) {
    return res.status(415).json({ message: err.message, success: false });
  }

  return res.status(500).json({ message: "Internal server error.", success: false });
});

// -------------------- SERVER START --------------------
connectDB()
  .then(async () => {
    await rescheduleAllPendingExpiries();

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Startup failed:", error.message);
    process.exit(1);
  });
