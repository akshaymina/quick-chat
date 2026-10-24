import Status from "./components/Status";
import Signup from "./components/Signup";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/userSlice";
import { BASE_URL } from "./config";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/status", element: <Status /> },
]);

function App() {
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const authUserId = authUser?._id;

  useEffect(() => {
    if (!authUserId) return;

    // The server identifies the user from the auth cookie, so credentials
    // must be sent with the handshake (no userId query param any more).
    const socketio = io(BASE_URL, { withCredentials: true });
    dispatch(setSocket(socketio));

    socketio.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    return () => {
      socketio.close();
      dispatch(setSocket(null));
      dispatch(setOnlineUsers(null));
    };
  }, [authUserId, dispatch]);

  return (
    <div className="h-screen flex items-center justify-center">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
