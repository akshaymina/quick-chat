import axios from "axios";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IoSend, IoTimerOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../config";
import { addMessage } from "../redux/messageSlice";
import { FiPaperclip } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

// Self-destruct expiry options. Values are seconds as strings, sent to the
// backend in FormData. "0" = Never. Must match the server's allow-list.
const EXPIRY_OPTIONS = [
  { label: "Never", value: "0" },
  { label: "30 Seconds", value: "30" },
  { label: "1 Minute", value: "60" },
  { label: "5 Minutes", value: "300" },
];

const SendInput = ({ onSmartReply }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const [file, setFile] = useState(null);
  const [expiresIn, setExpiresIn] = useState("0");
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);
  const { theme } = useTheme();

  const draftKey = selectedUser ? `draft_${selectedUser._id}` : null;

  // Load this chat's draft when the conversation changes.
  useEffect(() => {
    if (!draftKey) return;

    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setMessage(savedDraft);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            textareaRef.current.scrollHeight + "px";
        }
      }, 0);
    } else {
      // No draft for this chat: don't carry over the previous chat's text.
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }

    // Attached files aren't persisted in drafts; reset on chat switch.
    setFile(null);
  }, [draftKey]);

  // Persist the draft as the user types.
  useEffect(() => {
    if (!draftKey) return;

    if (message.trim()) {
      localStorage.setItem(draftKey, message);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [message, draftKey]);

  // ================= SEND MESSAGE =================
  const sendMessage = async (textOverride) => {
    // textOverride is used by smart replies; from a click/key handler the
    // argument would be an event object, so check for a string.
    const text = typeof textOverride === "string" ? textOverride : message;

    if ((!text.trim() && !file) || isSending || !selectedUser) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("message", text);
      formData.append("expiresIn", expiresIn);
      if (file) {
        formData.append("file", file);
      }

      // No manual Content-Type: the browser must add the multipart boundary.
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      dispatch(addMessage(res.data.newMessage));

      setMessage("");
      setFile(null);
      setExpiresIn("0");
      if (draftKey) localStorage.removeItem(draftKey);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Let the smart-reply buttons send text directly. (The old version did
  // setMessage(text) then setTimeout(sendMessage), but the timeout still saw
  // the stale empty `message`, so smart replies never sent anything.)
  useEffect(() => {
    if (!onSmartReply) return;
    onSmartReply.current = (text) => sendMessage(text);
    return () => {
      onSmartReply.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const handleChange = (e) => {
    setMessage(e.target.value);

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`px-4 py-3 border-t border-slate-700 ${theme.appBg}`}>
      <div className="mx-auto max-w-4xl">
        <div className={`flex items-end gap-2 ${theme.inputBg} rounded-lg px-3 py-2`}>
          <input
            type="file"
            id="fileInput"
            hidden
            onChange={(e) => {
              setFile(e.target.files[0] || null);
              // Allow re-selecting the same file after removing it.
              e.target.value = "";
            }}
          />

          <label
            htmlFor="fileInput"
            className="cursor-pointer text-gray-400 hover:text-white"
          >
            <FiPaperclip size={18} />
          </label>

          {/* Self-destruct expiry picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowExpiryMenu((v) => !v)}
              title="Self-destruct timer"
              className={
                expiresIn !== "0" ? "text-orange-400" : "text-gray-400 hover:text-white"
              }
            >
              <IoTimerOutline size={18} />
            </button>

            {showExpiryMenu && (
              <div
                className={`absolute bottom-8 left-0 z-10 w-36 rounded-lg overflow-hidden shadow-lg ${theme.panelBg} border border-white/10`}
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      setExpiresIn(opt.value);
                      setShowExpiryMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-white ${theme.hoverBg} ${
                      expiresIn === opt.value ? "font-semibold" : ""
                    }`}
                  >
                    {opt.value !== "0" && "🔥 "}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message"
            className="
              w-full resize-none bg-transparent text-white
              outline-none
              overflow-y-auto overflow-x-hidden
              whitespace-pre-wrap break-words
              leading-5
            "
            style={{
              maxHeight: "160px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={isSending}
            aria-label="Send message"
            className={`${theme.accentText} shrink-0 rounded-full disabled:opacity-50`}
          >
            <IoSend size={20} />
          </button>
        </div>

        {file && (
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            <span>Attached: {file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}

        {expiresIn !== "0" && (
          <div className="text-xs text-orange-400 mt-1">
            🔥 This message will self-destruct{" "}
            {EXPIRY_OPTIONS.find((o) => o.value === expiresIn)?.label.toLowerCase()}{" "}
            after sending
          </div>
        )}
      </div>
    </div>
  );
};

export default SendInput;
