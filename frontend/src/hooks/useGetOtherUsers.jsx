import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "../config";
import { setOtherUsers } from "../redux/userSlice";

// Fetches all chat users once (per logged-in user) and stores them in Redux.
const useGetOtherUsers = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((store) => store.user);
  const authUserId = authUser?._id;

  useEffect(() => {
    if (!authUserId) return;

    const fetchOtherUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/user`, {
          withCredentials: true,
        });
        dispatch(setOtherUsers(res.data?.users || res.data));
      } catch (error) {
        console.error("Fetch other users error:", error);
        if (error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "Failed to load contacts");
        }
      }
    };
    fetchOtherUsers();
  }, [authUserId, dispatch]);
};

export default useGetOtherUsers;
