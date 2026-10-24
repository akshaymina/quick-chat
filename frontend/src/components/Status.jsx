import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { BASE_URL } from "../config";

import MyStatus from "./status/MyStatus";
import StatusList from "./status/StatusList";

const Status = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useSelector((store) => store.user);
  const navigate = useNavigate();

  // Same auth-guard pattern used in HomePage.jsx — this route had none
  // before, so an unauthenticated visitor would just sit on a page making
  // API calls that fail silently instead of being sent to /login.
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);

  const fetchStatuses = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/status`,
        { withCredentials: true }
      );

      setStatuses(res.data);
    } catch (err) {
      console.error("Fetch status error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return (
    <div className="h-full w-full bg-black text-white p-4 overflow-y-auto">
      {/* Previously no way back to chat except the browser back button. */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
      >
        <IoArrowBack size={20} />
        <span>Back to chats</span>
      </button>

      <MyStatus onStatusAdded={fetchStatuses} />

      {loading ? (
        <p className="text-center text-gray-400 mt-4">Loading statuses...</p>
      ) : (
        <StatusList statuses={statuses} />
      )}
    </div>
  );
};

export default Status;
