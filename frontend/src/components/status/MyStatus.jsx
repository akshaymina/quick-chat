import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../config";

const MyStatus = ({ onStatusAdded }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const addStatus = async () => {
    if (!text.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await axios.post(
        `${BASE_URL}/api/v1/status`,
        { type: "text", text },
        { withCredentials: true }
      );

      setText("");
      setOpen(false);
      onStatusAdded();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to post status");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 mb-4 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-xl">
          +
        </div>
        <p className="font-medium">My Status</p>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-4 rounded w-80">
            <textarea
              className="w-full bg-black p-2 rounded text-white"
              placeholder="Type status..."
              maxLength={700}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-3">
              <button onClick={() => setOpen(false)} className="text-green-500">
                Cancel
              </button>
              <button
                onClick={addStatus}
                disabled={isPosting}
                className="bg-green-500 text-black px-4 py-1 rounded disabled:opacity-60"
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyStatus;
