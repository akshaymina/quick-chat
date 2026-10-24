import mongoose from "mongoose";
import { Status } from "../models/statusModel.js";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * @desc    Create new status
 * @route   POST /api/v1/status
 * @access  Private
 */
export const createStatus = async (req, res) => {
  try {
    const { type, text, mediaUrl, backgroundColor } = req.body;

    if (!type || !["text", "image"].includes(type)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    if (type === "text" && (typeof text !== "string" || text.trim() === "")) {
      return res
        .status(400)
        .json({ message: "Text content is required for text status" });
    }

    if (type === "image" && (typeof mediaUrl !== "string" || mediaUrl.trim() === "")) {
      return res
        .status(400)
        .json({ message: "Media URL is required for image status" });
    }

    if (backgroundColor !== undefined && !HEX_COLOR.test(backgroundColor)) {
      return res.status(400).json({ message: "Invalid background color" });
    }

    const status = await Status.create({
      userId: req.id,
      type,
      text: typeof text === "string" ? text.trim() : undefined,
      mediaUrl,
      backgroundColor,
    });

    res.status(201).json(status);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to create status" });
  }
};

/**
 * @desc    Get active statuses
 * @route   GET /api/v1/status
 * @access  Private
 */
export const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "fullName profilePhoto")
      .sort({ createdAt: -1 });

    res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch statuses" });
  }
};

/**
 * @desc    Mark status as viewed
 * @route   POST /api/v1/status/view/:id
 * @access  Private
 */
export const viewStatus = async (req, res) => {
  try {
    const statusId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ message: "Invalid status ID" });
    }

    const status = await Status.findOne({
      _id: statusId,
      expiresAt: { $gt: new Date() },
    });

    if (!status) {
      return res.status(404).json({ message: "Status expired or not found" });
    }

    if (status.userId.toString() === req.id) {
      return res.status(200).json({ message: "Owner view ignored" });
    }

    // Atomic add — avoids a save() race when two viewers open it at once.
    const updated = await Status.findByIdAndUpdate(
      statusId,
      { $addToSet: { viewers: req.id } },
      { new: true }
    );

    res.status(200).json({
      message: "Status viewed",
      viewersCount: updated.viewers.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status view" });
  }
};
