import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },

    text: {
      type: String,
      maxlength: 700,
    },

    mediaUrl: {
      type: String,
    },

    backgroundColor: {
      type: String,
      default: "#25D366",
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true }
);

// Let MongoDB delete expired statuses automatically (the queries only hide
// them, so without this the collection grows forever).
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Status = mongoose.model("Status", statusSchema);
