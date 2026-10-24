import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: null, // null = not loaded yet, otherwise an array
  },

  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    addMessage: (state, action) => {
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      // Ignore duplicates (e.g. the same message arriving via HTTP + socket).
      if (state.messages.some((m) => m._id === action.payload._id)) return;
      state.messages.push(action.payload);
    },

    removeMessage: (state, action) => {
      if (!Array.isArray(state.messages)) return;
      state.messages = state.messages.filter(
        (message) => message._id !== action.payload
      );
    },

    updateMessageContent: (state, action) => {
      const { messageId, message, editedAt } = action.payload;
      const msg = state.messages?.find((m) => m._id === messageId);
      if (msg) {
        msg.message = message;
        msg.editedAt = editedAt;
      }
    },

    updateMessageReaction: (state, action) => {
      const { messageId, reactions } = action.payload;
      const msg = state.messages?.find((m) => m._id === messageId);
      if (msg) {
        msg.reactions = reactions;
      }
    },
  },
});

export const {
  setMessages,
  addMessage,
  removeMessage,
  updateMessageContent,
  updateMessageReaction,
} = messageSlice.actions;

export default messageSlice.reducer;
