
import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    if (!message?.trim() && !req.file) {    //   message?.trim()---message && message.trim()
      return res.status(400).json({
        success: false,
        message: "Select a file or enter a message to send",
      });
    }

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
    });


    conversation.messages.push(newMessage._id);
    await conversation.save();

    // SOCKET EMIT
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({ newMessage });
  } catch (error) {
    console.error("SendMessage error:", error);
    return res.status(500).json({ success: false });
  }
};


/* ================= GET MESSAGES ================= */
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    const filteredMessages = conversation.messages.filter(
      (msg) => !msg.deletedFor?.includes(senderId)
    );

    return res.status(200).json(filteredMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

/* ============ DELETE MESSAGE FOR ME ============= */
export const deleteMessageForMe = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.id;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Message deleted for you successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};



// this is for editing the message
export const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { newMessage } = req.body;
    const userId = req.id;

    if (!newMessage || !newMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
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

    return res.status(200).json({
      success: true,
      message: "Message edited successfully",
      msg,
    });
  } catch (err) {
    console.error("Edit message error:", err);
    return res.status(500).json({
      success: false,
      message: "Edit failed",
    });
  }
};



/* ============ REACT TO A MESSAGE ============= */

export const reactToMessage = async (req, res) => {
  try {

    const messageId = req.params.id;
    const userId = req.id;
    const { emoji } = req.body;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    const existingReactionIndex = msg.reactions.findIndex(
      (reaction) => reaction.userId.toString() === userId
    );
    if (existingReactionIndex !== -1) {
      msg.reactions[existingReactionIndex].emoji = emoji;
    } else {
      msg.reactions.push({ userId, emoji });
    }
    await msg.save();

    return res.status(200).json({
      success: true,
      message: "Reaction added/updated successfully",
      msg
    });
  } catch (error) {
    console.error("React to message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to react to message"
    });

  }
};


