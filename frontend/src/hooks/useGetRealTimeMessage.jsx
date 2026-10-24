import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addMessage,
  updateMessageReaction,
  updateMessageContent,
  removeMessage,
} from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector((store) => store.socket);
  const { selectedUser, authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (newMessage) => {
      const belongsToOpenConversation =
        selectedUser?._id &&
        authUser?._id &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === authUser._id) ||
          (newMessage.senderId === authUser._id &&
            newMessage.receiverId === selectedUser._id));

      if (belongsToOpenConversation) {
        dispatch(addMessage(newMessage));
      }
    };

    const onReaction = ({ messageId, reactions }) =>
      dispatch(updateMessageReaction({ messageId, reactions }));

    const onEdited = ({ messageId, message, editedAt }) =>
      dispatch(updateMessageContent({ messageId, message, editedAt }));

    const onExpired = ({ messageId }) => dispatch(removeMessage(messageId));

    socket.on("newMessage", onNewMessage);
    socket.on("messageReaction", onReaction);
    socket.on("messageEdited", onEdited);
    socket.on("messageExpired", onExpired);

    // Remove only OUR handlers (a bare socket.off("event") removes every
    // listener for that event, including ones registered elsewhere).
    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageReaction", onReaction);
      socket.off("messageEdited", onEdited);
      socket.off("messageExpired", onExpired);
    };
  }, [socket, selectedUser?._id, authUser?._id, dispatch]);
};

export default useGetRealTimeMessage;
