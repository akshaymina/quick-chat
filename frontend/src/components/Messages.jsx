import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessages from "../hooks/useGetMessages";
import { useSelector } from "react-redux";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";

const Messages = () => {
  useGetMessages();
  useGetRealTimeMessage();
  const { messages } = useSelector((store) => store.message);
  const bottomRef = useRef(null);
  const count = messages?.length || 0;

  // Scroll to the newest message only when the number of messages changes.
  // (Each Message used to scroll itself into view on EVERY update, so an
  // edit or reaction on an old message yanked the view away from the bottom.)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [count]);

  return (
    <div className="px-4 flex-1 overflow-auto">
      {messages?.map((message) => (
        <Message key={message._id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default Messages;
