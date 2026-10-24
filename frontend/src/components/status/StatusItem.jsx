import { useState } from "react";
import StatusViewer from "./StatusViewer";

const StatusItem = ({ status }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 mb-3 cursor-pointer"
      >
        <img
          src={status.userId?.profilePhoto}
          alt=""
          className="w-10 h-10 rounded-full border-2 border-green-500"
        />
        <div>
          <p className="font-medium">{status.userId?.fullName}</p>
        </div>
      </div>

      {open && (
        <StatusViewer status={status} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default StatusItem;
