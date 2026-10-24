import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "../config";
import { setMessages } from "../redux/messageSlice";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);

  useEffect(() => {
    if (!selectedUser?._id) return;

    // `active` goes false when the user switches chats, so a slow response
    // for the previous chat can't overwrite the current one.
    let active = true;

    // Clear the previous chat immediately so its messages don't flash in the
    // newly selected conversation while this one loads.
    dispatch(setMessages(null));

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/v1/message/${selectedUser._id}`,
          { withCredentials: true }
        );

        if (active) {
          dispatch(setMessages(res.data));
        }
      } catch (error) {
        console.error("Fetch messages error:", error);
        if (active && error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        }
      }
    };
    fetchMessages();

    return () => {
      active = false;
    };
  }, [selectedUser?._id, dispatch]);
};

export default useGetMessages;
