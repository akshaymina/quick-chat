import mongoose from "mongoose";

const messageModel = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",      //senderId and receiverId are IDs of documents in the User collection."
      required: true,
    },
    message: {
      type: String,
      default: "", // ✅ FIXED
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
      },
    ],
    image: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      default: null, // ✅ ADDED
    },
    // ===== SELF-DESTRUCT MESSAGES =====
    // null = "Never" (default, no expiry). When set, the message should
    // disappear for everyone at this timestamp.
    expiresAt: {
      type: Date,
      default: null,
    },
    // Soft-delete flag set the instant the scheduled expiry timer fires
    // (see messageController.js scheduleMessageExpiry), just before the
    // document is actually removed from the DB. Exists mainly so any
    // in-flight request that reads the message between "timer fired" and
    // "delete finished" can recognize it's already gone rather than acting
    // on stale data.
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically deletes a document once the current
// time passes the value stored in `expiresAt`. expireAfterSeconds: 0 means
// "delete exactly at the time in the field" (not N seconds after it).
// Documents where expiresAt is null are simply never matched by this and
// are never auto-deleted — this is what makes "Never" work correctly.
// This is a SAFETY NET only: the TTL background sweep runs roughly once a
// minute, so this alone would not delete a message the instant it expires.
// The actual instant deletion + socket broadcast is handled by an
// in-memory setTimeout scheduled in messageController.js at send-time;
// this index guarantees eventual cleanup even if that timer is lost (e.g.
// a server restart before the message expires).
messageModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Message = mongoose.model("Message", messageModel);
