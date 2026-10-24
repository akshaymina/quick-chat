// Single source of truth for allowed browser origins (used by both the
// Express CORS config and the Socket.IO CORS config).
// Add more at deploy time with a comma-separated ALLOWED_ORIGINS env var,
// e.g. ALLOWED_ORIGINS=https://my-app.com,http://192.168.1.5:3000
const defaults = [
  "http://localhost:3000",
  "https://chat-app23.onrender.com",
];

const fromEnv = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const allowedOrigins = [...new Set([...defaults, ...fromEnv])];
