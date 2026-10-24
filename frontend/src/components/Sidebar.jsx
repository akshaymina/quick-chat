import axios from "axios";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BiSearchAlt2 } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { setMessages } from "../redux/messageSlice";
import {
  setAuthUser,
  setOtherUsers,
  setSelectedUser,
} from "../redux/userSlice";
import OtherUsers from "./OtherUsers";
import Settings from "./Settings";
import { useTheme } from "../context/ThemeContext";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { otherUsers } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();

  /* ================= LOGOUT ================= */
  const confirmLogoutHandler = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );

      toast.success(res.data.message);

      dispatch(setAuthUser(null));
      dispatch(setMessages([]));
      dispatch(setOtherUsers(null));
      dispatch(setSelectedUser(null));

      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  /* ================= SEARCH ================= */
  // BUGFIX: previously dispatched setOtherUsers([user]) on search, which
  // permanently overwrote the full contact list in Redux with just the
  // matched result — there was no way back to the full list short of a
  // page reload (clearing the search box did nothing). Now search only
  // computes a local, derived filtered view; the underlying `otherUsers`
  // list in Redux is never touched, so clearing the box always restores
  // everyone immediately.
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(otherUsers)) return otherUsers;
    const query = search.trim().toLowerCase();
    if (!query) return otherUsers;
    return otherUsers.filter((u) =>
      u.fullName.toLowerCase().includes(query)
    );
  }, [otherUsers, search]);

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    if (search.trim() && filteredUsers?.length === 0) {
      toast.error("User not found");
    }
  };

  return (
    <div className={`h-full w-full flex flex-col ${theme.sidebarBg} border-r border-slate-700`}>



      {/* SEARCH */}
      <div className="p-4 shrink-0 flex gap-2 items-center">
        <form onSubmit={searchSubmitHandler} className="flex gap-2 flex-1 min-w-0">
          <input
            className="input input-bordered w-full min-w-0"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
            }}
          />
          <button className={`btn ${theme.buttonPrimary} text-white shrink-0`}>
            <BiSearchAlt2 />
          </button>
        </form>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className={`btn btn-square shrink-0 ${theme.inputBg} text-white ${theme.hoverBg}`}
        >
          <IoSettingsOutline size={18} />
        </button>
      </div>



      {/* USERS */}
      <div className="flex-1 overflow-y-auto px-2">
        <OtherUsers users={filteredUsers} />
      </div>




      {/* STATUS */}
      <div className="px-4 pb-2 shrink-0">
        <button
          onClick={() => navigate("/status")}
          className={`btn btn-sm w-full ${theme.inputBg} ${theme.hoverBg} text-white`}
        >
          Status
        </button>
      </div>




      {/* LOGOUT */}
      <div className="p-4 border-t border-slate-700 shrink-0">
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`btn btn-sm w-full ${theme.inputBg} hover:bg-red-600 text-white`}
        >
          Logout
        </button>
      </div>



      {showSettings && <Settings onClose={() => setShowSettings(false)} />}



      {/* confirmation before logging out. */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Confirm Logout?</h3>
            <p className="mb-4">Are you sure you want to logout?</p>

            <div className="py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-3 py-1 rounded-md bg-green-200 text-green-700 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogoutHandler}
                className="px-3 py-1 rounded-md bg-red-200 text-red-800 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
