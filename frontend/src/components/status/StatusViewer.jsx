import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

const StatusViewer = ({ status, onClose }) => {
  // Record the view; failures here shouldn't surface as unhandled rejections.
  useEffect(() => {
    axios
      .post(`${BASE_URL}/api/v1/status/view/${status._id}`, {}, { withCredentials: true })
      .catch((err) => console.error("Status view error:", err));
  }, [status._id]);

  return (
    <div
      onClick={onClose}
      style={{ backgroundColor: status.backgroundColor || "#000000" }}
      className="fixed inset-0 flex items-center justify-center p-6 text-center text-white text-xl z-50 whitespace-pre-wrap break-words"
    >
      {status.text}
    </div>
  );
};

export default StatusViewer;
