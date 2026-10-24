import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { FaFilePdf, FaFileDownload } from "react-icons/fa";
import { BASE_URL } from "../config";
import { removeMessage, updateMessageContent } from "../redux/messageSlice";
import { useTheme } from "../context/ThemeContext";

const Message = ({ message }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const { authUser } = useSelector((store) => store.user);

  const [showDelete, setShowDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message?.message || "");
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const isSender =
    message?.senderId?.toString() === authUser?._id?.toString();

  // 5-minute edit rule
  const EDIT_TIME = 5 * 60 * 1000;
  const canEdit =
    isSender &&
    Date.now() - new Date(message?.createdAt).getTime() < EDIT_TIME;

  // 🔥 SELF-DESTRUCT countdown. The actual deletion + removal from every
  // client is driven by the backend's scheduled timer + "messageExpired"
  // socket broadcast (handled globally in useGetRealTimeMessage.jsx) —
  // this local countdown is purely a display concern, ticking down once a
  // second from message.expiresAt so the user sees "Expires in Ns".
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!message?.expiresAt) return null;
    return Math.max(
      0,
      Math.ceil((new Date(message.expiresAt).getTime() - Date.now()) / 1000)
    );
  });

  useEffect(() => {
    if (!message?.expiresAt) {
      setRemainingSeconds(null);
      return;
    }
    const tick = () => {
      const secs = Math.max(
        0,
        Math.ceil((new Date(message.expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(secs);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [message?.expiresAt]);

  // Delete message
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/api/v1/message/delete-for-me/${message._id}`,
        { withCredentials: true }
      );
      dispatch(removeMessage(message._id));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  // Save edited message
  const handleSaveEdit = async () => {
    if (!editedMessage.trim()) return;

    try {
      setIsSaving(true);
      const res = await axios.put(
        `${BASE_URL}/api/v1/message/edit/${message._id}`,
        { newMessage: editedMessage },
        { withCredentials: true }
      );

      // BUGFIX: was mutating `message.message`/`message.editedAt` directly
      // on the object stored in Redux, outside of any reducer. React can't
      // reliably detect that kind of mutation as a state change, so the UI
      // could fail to re-render with the edit until something else
      // triggered a render. Dispatching through the proper reducer instead.
      dispatch(
        updateMessageContent({
          messageId: message._id,
          message: res.data.msg.message,
          editedAt: res.data.msg.editedAt,
        })
      );
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to edit message");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* MESSAGE ROW */}
      <div
        className={`flex w-full mb-2 px-2 ${
          isSender ? "justify-end" : "justify-start"
        }`}
      >
        {/* MESSAGE BUBBLE */}
        <div className="max-w-[65%]">
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setShowDelete(true);
            }}
            className={`relative rounded-lg text-sm break-words whitespace-pre-wrap
              ${
                isSender
                  ? `${theme.bubbleSent} text-white rounded-br-none`
                  : `${theme.bubbleReceived} text-white rounded-bl-none`
              }
              ${message?.image ? "p-2" : "px-3 py-2"}
            `}
          >
            {/* EDIT MODE */}
            {isEditing ? (
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full bg-transparent border border-gray-500 rounded p-1 text-sm resize-none"
                rows={2}
                autoFocus
              />
            ) : (
              <div className="flex flex-col gap-1">
                {/* ATTACHMENT */}
                {/* BUGFIX: previously always rendered message.image through
                    an <img> tag no matter the actual file type. The field
                    is named "image" but backend/messageController.js
                    stores ANY uploaded file's URL there (PDFs, audio,
                    etc.) — forcing a PDF through <img> just shows a
                    broken-image icon. Branching on message.fileType so
                    each kind renders something that actually works. */}
                {message?.image && (
                  <>
                    {message.fileType?.startsWith("image/") ? (
                      <img
                        src={`${BASE_URL}${message.image}`}
                        alt="sent"
                        className="max-w-[220px] rounded-lg cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(message.image);
                        }}
                      />
                    ) : message.fileType === "application/pdf" ? (
                      <a
                        href={`${BASE_URL}${message.image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 bg-black/20 hover:bg-black/30 rounded-lg p-2 max-w-[220px]"
                      >
                        <FaFilePdf size={22} className="shrink-0" />
                        <span className="text-sm underline truncate">
                          View PDF
                        </span>
                      </a>
                    ) : message.fileType?.startsWith("audio/") ? (
                      <audio
                        controls
                        src={`${BASE_URL}${message.image}`}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-[220px]"
                      />
                    ) : (
                      <a
                        href={`${BASE_URL}${message.image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 bg-black/20 hover:bg-black/30 rounded-lg p-2 max-w-[220px]"
                      >
                        <FaFileDownload size={20} className="shrink-0" />
                        <span className="text-sm underline truncate">
                          Download attachment
                        </span>
                      </a>
                    )}
                  </>
                )}

                {/* TEXT + TIME (INLINE FIXED) */}
                {(message?.message || message?.image || remainingSeconds !== null) && (
                  <div className="flex flex-wrap items-end gap-x-1">
                    {message?.message && (
                      <span className="break-words">{message.message}</span>
                    )}

                    <span className="text-[10px] opacity-70 whitespace-nowrap">
                      {message?.editedAt && "(edited) "}
                      {new Date(message?.createdAt).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </span>

                    {/* 🔥 self-destruct countdown */}
                    {remainingSeconds !== null && (
                      <span className="text-[10px] text-orange-300 whitespace-nowrap">
                        🔥 Expires in {remainingSeconds}s
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EDIT BUTTON */}
            {canEdit && !isEditing && !message?.image && (
              <button
                className="absolute top-1 right-1 text-xs text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
            )}

            {/* EDIT ACTIONS */}
            {isEditing && (
              <div className="absolute top-1 right-1 flex gap-2">
                <button
                  className="text-xs text-green-400"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className="text-xs text-red-400"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedMessage(message?.message || "");
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDelete && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="bg-gray-800 text-white rounded-lg w-64 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm mb-4">Delete message?</p>
            <div className="flex justify-end gap-4 text-sm">
              <button
                className="text-gray-400"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="text-red-400"
                onClick={() => {
                  handleDelete();
                  setShowDelete(false);
                }}
              >
                Delete for me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={`${BASE_URL}${previewImage}`}
            alt="preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default Message;
