import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";

const OtherUser = ({ user }) => {
  const dispatch = useDispatch();
  const { selectedUser, onlineUsers } = useSelector((store) => store.user);
  const isOnline = onlineUsers?.includes(user._id);
  const isSelected = selectedUser?._id === user?._id;

  return (
    <>
      <div
        onClick={() => dispatch(setSelectedUser(user))}
        className={`${
          isSelected ? "bg-zinc-200 text-black" : "text-white"
        } flex gap-2 hover:text-black items-center hover:bg-zinc-200 rounded p-2 cursor-pointer`}
      >
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between gap-2">
            <p>{user?.fullName}</p>
            <span
              title={isOnline ? "Online" : "Offline"}
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            />
          </div>
        </div>
      </div>
      <div className="divider my-0 py-0 h-1"></div>
    </>
  );
};

export default OtherUser;
