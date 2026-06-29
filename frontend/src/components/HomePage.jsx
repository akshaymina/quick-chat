import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { authUser } = useSelector((store) => store.user);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const [sidebarPercent, setSidebarPercent] = useState(30);  // initial 
  const [dragging, setDragging] = useState(false);


  // check  if user already  login  or not , if not just rediirect to  login  page ,
  //  if defined stay  on this page 
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);


  // onMouseDown fires the moment you press the left mouse button on the drag line. 
  // You don't have to move the mouse. 
  const onMouseDown = () => {
    setDragging(true);
    document.body.style.cursor = "col-resize";
  };


  // Now you start moving the mouse
  // Every movement triggers
  const onMouseMove = (e) => {
    if (!dragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;

    if (percent >= 25 && percent <= 50) {
      setSidebarPercent(percent);
    }
  };

  // this runs when  u  release the mouse and resizing stops.
  const onMouseUp = () => {
    setDragging(false);
    document.body.style.cursor = "default";
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      className="flex h-screen w-screen overflow-hidden bg-black"
    >
      {/* SIDEBAR */}
      <div
        className="h-full"
        style={{ width: `${sidebarPercent}%` }}
      >
        <Sidebar />
      </div>

      {/* DRAG LINE */}
      <div
        onMouseDown={onMouseDown}
        className="w-[3px] cursor-col-resize bg-white/10 hover:bg-green-500"
      />

      {/* CHAT */}
      <div
        className="h-full"
        style={{ width: `${100 - sidebarPercent}%` }}
      >
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;











// ==========================
// IMPORTANT REACT NOTES
// ==========================

// 1. Any state change (setState) causes HomePage() to run again.
//    React creates a new Virtual DOM and updates ONLY the changed parts
//    of the Real DOM (not the entire page).

// 2. useState(initialValue)
//    -> initialValue is used ONLY on the first render.
//    -> React remembers the updated state after that.

// 3. useRef()
//    -> Stores a DOM element or value.
//    -> Updating ref.current DOES NOT cause a re-render.

// 4. useEffect()
//    -> Runs AFTER the component renders.
//    -> Runs again whenever a dependency changes.

// 5. useSelector()
//    -> Reads data from the Redux store.
//    -> If the selected data changes, this component re-renders.

// 6. navigate("/login")
//    -> Side effect (navigation), so it belongs inside useEffect.

// 7. Mouse Events Flow
//    onMouseDown -> Start dragging
//    onMouseMove -> Resize sidebar while dragging
//    onMouseUp   -> Stop dragging

// 8. containerRef.current.getBoundingClientRect()
//    -> Gives the container's position and size.
//    -> Used to calculate the mouse position as a percentage.

// 9. setSidebarPercent(percent)
//    -> Updates sidebar width.
//    -> React re-renders and only updates the width styles.

// 10. React Rendering Flow
//     User Action
//          ↓
//     setState()
//          ↓
//     Component function runs again
//          ↓
//     New Virtual DOM
//          ↓
//     Compare with old Virtual DOM
//          ↓
//     Update only changed DOM elements



// Initial Render
// React calls HomePage().
// sidebarPercent = 40, dragging = false.
// React creates the Virtual DOM and then renders the Real DOM.
// Browser shows:
// Sidebar (40%) | Chat (60%).

// User clicks the drag line.
// onMouseDown() runs.
// setDragging(true) updates the state.

// State changed -> React calls HomePage() again.
// React creates a new Virtual DOM.
// Since only 'dragging' changed (not the UI), almost nothing updates in the browser.

// User starts dragging.
// onMouseMove() runs.
// setSidebarPercent(45) updates the state.

// React calls HomePage() again.
// New Virtual DOM:
// Sidebar width = 45%
// Chat width = 55%

// React compares the old and new Virtual DOM.
// Only the width styles changed.

// React updates only:
// Sidebar width
// Chat width

// React DOES NOT recreate:
// Sidebar component
// MessageContainer component
// Drag line

// Rule to remember:
// setState()
//     ↓
// Component function runs again
//     ↓
// New Virtual DOM is created
//     ↓
// React compares with the old Virtual DOM
//     ↓
// Only the changed parts of the Real DOM are updated