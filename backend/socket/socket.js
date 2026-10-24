import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import { allowedOrigins } from "../config/origins.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// userId -> number of open sockets (supports several tabs/devices per user)
const onlineCounts = new Map();

// Every socket joins a room named after its user id, so emitting to a user
// reaches all of their tabs and survives reconnects.
export const emitToUser = (userId, event, payload) => {
  if (!userId) return;
  io.to(userId.toString()).emit(event, payload);
};

const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf("=");
        return [part.slice(0, idx), decodeURIComponent(part.slice(idx + 1))];
      })
  );

// Identify the user from the signed JWT cookie, not from a client-supplied
// query param (which anyone could fake to eavesdrop on another user).
io.use((socket, next) => {
  try {
    const { token } = parseCookies(socket.handshake.headers.cookie);
    if (!token) return next(new Error("Not authenticated"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.userId = String(decoded.userId);
    next();
  } catch (err) {
    next(new Error("Invalid or expired session"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;

  socket.join(userId);
  onlineCounts.set(userId, (onlineCounts.get(userId) || 0) + 1);
  io.emit("getOnlineUsers", [...onlineCounts.keys()]);

  socket.on("disconnect", () => {
    const remaining = (onlineCounts.get(userId) || 1) - 1;
    if (remaining <= 0) {
      onlineCounts.delete(userId);
    } else {
      onlineCounts.set(userId, remaining);
    }
    io.emit("getOnlineUsers", [...onlineCounts.keys()]);
  });
});

export { app, io, server };
