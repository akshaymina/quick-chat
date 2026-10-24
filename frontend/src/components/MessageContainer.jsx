import React, { useEffect, useRef, useState } from "react";
import SendInput from "./SendInput";
import Messages from "./Messages";
import { useSelector } from "react-redux";
import { smartReplyRules } from "../utils/smartReplies";
import { useTheme } from "../context/ThemeContext";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Match whole words/phrases only, and prefer the LONGEST matching keyword.
// The old substring check made "hi" match "this"/"nothing"/"which", and the
// first rule in the list always won, so most messages got "Hi!" replies.
const getSmartReplies = (text) => {
  if (!text) return [];
  const lower = text.toLowerCase();

  let best = null;
  let bestLength = 0;

  for (const rule of smartReplyRules) {
    for (const key of rule.keywords) {
      const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(key)}($|[^a-z0-9])`);
      if (key.length > bestLength && pattern.test(lower)) {
        best = rule.replies;
        bestLength = key.length;
      }
    }
  }
  return best || [];
};

const MessageContainer = () => {
  const { selectedUser, authUser, onlineUsers } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);
  const { theme } = useTheme();

  const isOnline = onlineUsers?.includes(selectedUser?._id);

  const [smartReplies, setSmartReplies] = useState([]);
  const smartReplyRef = useRef(null);

  // Suggest replies based on the last incoming message.
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setSmartReplies([]);
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.senderId !== authUser?._id) {
      setSmartReplies(getSmartReplies(lastMessage.message));
    } else {
      setSmartReplies([]);
    }
  }, [messages, authUser]);

  // Don't carry suggestions over to another conversation.
  useEffect(() => {
    setSmartReplies([]);
  }, [selectedUser?._id]);

  return (
    <div className={`h-full w-full flex flex-col min-h-0 ${theme.appBg}`}>
      {selectedUser ? (
        <>
          {/* HEADER */}
          <div className={`shrink-0 flex gap-2 items-center ${theme.headerBg} text-white px-4 py-2`}>
            <p className="font-medium">{selectedUser?.fullName}</p>
            <span
              className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
            <Messages />
          </div>

          {/* SMART REPLIES */}
          {smartReplies.length > 0 && (
            <div className={`shrink-0 flex flex-wrap gap-2 px-4 py-2 ${theme.panelBg} border-t border-white/10`}>
              {smartReplies.map((reply) => (
                <button
                  key={reply}
                  className={`px-3 py-1 text-sm rounded-full ${theme.inputBg} text-white ${theme.hoverBg} transition`}
                  onClick={() => {
                    smartReplyRef.current?.(reply);
                    setSmartReplies([]);
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div className="shrink-0">
            <SendInput onSmartReply={smartReplyRef} />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 className="text-4xl text-white font-bold">
            Hi, {authUser?.fullName}
          </h1>
          <h2 className="text-2xl text-white mt-2">
            Let&apos;s start a conversation
          </h2>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
