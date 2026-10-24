import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const HomePage = () => {
  const { authUser } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const containerRef = useRef(null);
  const [sidebarPercent, setSidebarPercent] = useState(30);
  const [dragging, setDragging] = useState(false);

  // Not logged in -> send to the login page.
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);

  // While dragging, listen on the whole window so releasing the mouse (or
  // moving fast) outside the container can't leave the divider "stuck".
  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setSidebarPercent(Math.min(50, Math.max(25, percent)));
    };

    const onMouseUp = () => setDragging(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  if (!authUser) return null;

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden ${theme.appBg}`}
    >
      {/* SIDEBAR */}
      <div className="h-full" style={{ width: `${sidebarPercent}%` }}>
        <Sidebar />
      </div>

      {/* DRAG LINE */}
      <div
        onMouseDown={() => setDragging(true)}
        className="w-[3px] cursor-col-resize bg-white/10 hover:bg-green-500"
      />

      {/* CHAT */}
      <div className="h-full min-w-0" style={{ width: `${100 - sidebarPercent}%` }}>
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;
