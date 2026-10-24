import mongoose from "mongoose";
import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import { emitToUser } from "../socket/socket.js";

const activeExpiryTimers = new Map();

// Self-destruct durations (seconds) the UI offers. Anything else is rejected
// so a client can't send an absurd value.
const ALLOWED_EXPIRY_SECONDS = new Set([0, 30, 60, 300]);
const MAX_MESSAGE_LENGTH = 5000;
const MAX_TIMER_MS = 2 ** 31 - 1; // setTimeout's upper limit

const isParticipant = (msg, userId) =>
  msg.senderId.toString() === userId || msg.receiverId.toString() === userId;

export const scheduleMessageExpiry = (messageId, senderId, receiverId, expiresAt) => {
  const delayMs = new Date(expiresAt).getTime() - Date.now();
  if (delayMs <= 0) return;

  const key = messageId.toString();

  const timer = setTimeout(async () => {
    try {
      // If the delay was clamped to MAX_TIMER_MS the message isn't due yet:
      // re-arm instead of deleting it early.
      if (new Date(expiresAt).getTime() - Date.now() > 1000) {
        return scheduleMessageExpiry(messageId, senderId, receiverId, expiresAt);
      }

      activeExpiryTimers.delete(key);
      const deleted = await Message.findByIdAndDelete(messageId);
      if (!deleted) return;

      // Keep the conversation's message list free of dangling ids.
      await Conversation.updateOne(
        { participants: { $all: [senderId, receiverId] } },
        { $pull: { messages: messageId } }
      );

      [senderId, receiverId].forEach((uid) => {
        emitToUser(uid, "messageExpired", { messageId: key });
      });
    } catch (err) {
      console.error("Message expiry error:", err);
    }
  }, Math.min(delayMs, MAX_TIMER_MS));

  activeExpiryTimers.set(key, timer);
};

export const rescheduleAllPendingExpiries = async () => {
  const now = new Date();

  // Messages whose expiry passed while the server was down: delete now.
  await Message.deleteMany({ expiresAt: { $ne: null, $lte: now } });

  const pending = await Message.find({
    expiresAt: { $ne: null, $gt: now },
    isExpired: false,
  });
  pending.forEach((msg) => {
    scheduleMessageExpiry(msg._id, msg.senderId, msg.receiverId, msg.expiresAt);
  });
  if (pending.length > 0) {
    console.log(`⏳ Rescheduled ${pending.length} pending self-destruct message(s)`);
  }
};

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message, expiresIn } = req.body;

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    if (message !== undefined && typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Invalid message" });
    }

    if (!message?.trim() && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Select a file or enter a message to send",
      });
    }

    if (message && message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    const expiresInSeconds = Number(expiresIn) || 0;
    if (!ALLOWED_EXPIRY_SECONDS.has(expiresInSeconds)) {
      return res.status(400).json({ success: false, message: "Invalid expiry option" });
    }
    const expiresAt =
      expiresInSeconds > 0 ? new Date(Date.now() + expiresInSeconds * 1000) : null;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: message || "",
      image: req.file ? `/uploads/${req.file.filename}` : null,
      fileType: req.file ? req.file.mimetype : null,
      expiresAt,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    if (expiresAt) {
      scheduleMessageExpiry(newMessage._id, senderId, receiverId, expiresAt);
    }

    emitToUser(receiverId, "newMessage", newMessage);

    return res.status(201).json({ newMessage });
  } catch (error) {
    console.error("SendMessage error:", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

/* ================= GET MESSAGES ================= */
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    const now = Date.now();
    const visibleMessages = conversation.messages.filter(
      (msg) =>
        !msg.deletedFor?.some((id) => id.toString() === senderId) &&
        !(msg.expiresAt && msg.expiresAt.getTime() <= now)
    );

    return res.status(200).json(visibleMessages);
  } catch (error) {
    console.error("GetMessage error:", error);
    return res.status(500).json({ success: false, message: "Failed to load messages" });
  }
};

/* ============ DELETE MESSAGE FOR ME ============= */
export const deleteMessageForMe = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.id;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    if (!isParticipant(msg, userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await Message.updateOne({ _id: messageId }, { $addToSet: { deletedFor: userId } });

    return res.status(200).json({
      success: true,
      message: "Message deleted for you successfully",
    });
  } catch (error) {
    console.error("DeleteMessage error:", error);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};

/* ================= EDIT MESSAGE ================= */
export const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { newMessage } = req.body;
    const userId = req.id;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }

    if (typeof newMessage !== "string" || !newMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      });
    }

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (msg.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can't edit this message",
      });
    }

    const timeDiff = Date.now() - msg.createdAt.getTime();
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(403).json({
        success: false,
        message: "Edit time window has expired",
      });
    }

    msg.message = newMessage;
    msg.editedAt = new Date();
    await msg.save();

    emitToUser(msg.receiverId, "messageEdited", {
      messageId: msg._id,
      message: msg.message,
      editedAt: msg.editedAt,
    });

    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      msg,
    });
  } catch (err) {
    console.error("Edit message error:", err);
    return res.status(500).json({ success: false, message: "Edit failed" });
  }
};

/* ============ REACT TO A MESSAGE ============= */
export const reactToMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.id;
    const { emoji } = req.body;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }

    if (typeof emoji !== "string" || !emoji.trim() || emoji.length > 16) {
      return res.status(400).json({ success: false, message: "Invalid emoji" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only the two people in the conversation may react.
    if (!isParticipant(msg, userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const existing = msg.reactions.find((r) => r.userId.toString() === userId);
    if (existing) {
      existing.emoji = emoji;
    } else {
      msg.reactions.push({ userId, emoji });
    }
    await msg.save();

    const otherUserId =
      msg.senderId.toString() === userId ? msg.receiverId : msg.senderId;
    emitToUser(otherUserId, "messageReaction", {
      messageId: msg._id,
      reactions: msg.reactions,
    });

    return res.status(200).json({
      success: true,
      message: "Reaction added/updated successfully",
      msg,
    });
  } catch (error) {
    console.error("React to message error:", error);
    return res.status(500).json({ success: false, message: "Failed to react to message" });
  }
};
