import React from "react";
import { useTheme } from "../context/ThemeContext";
import { IoClose } from "react-icons/io5";

// Settings modal: theme selector grid + custom accent picker.
// Rendered conditionally by Sidebar.jsx when the user clicks "Settings".
const Settings = ({ onClose }) => {
  const { themeKey, setThemeKey, customAccentKey, setCustomAccentKey, theme, THEMES, CUSTOM_ACCENTS } =
    useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`w-full max-w-md rounded-xl ${theme.panelBg} text-white shadow-xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className={`p-1 rounded-full ${theme.hoverBg}`}
          >
            <IoClose size={22} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Chat theme</h3>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className={`flex flex-col items-center gap-2 rounded-lg p-2 border-2 transition ${
                  themeKey === key ? "border-white" : "border-transparent"
                }`}
              >
                <span className={`w-full h-12 rounded-md ${t.swatch}`} />
                <span className="text-xs">{t.name}</span>
              </button>
            ))}
          </div>

          {themeKey === "custom" && (
            <div className="mt-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Accent color</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(CUSTOM_ACCENTS).map(([key, accent]) => (
                  <button
                    key={key}
                    onClick={() => setCustomAccentKey(key)}
                    aria-label={accent.label}
                    className={`w-9 h-9 rounded-full ${accent.bubbleSent} border-2 ${
                      customAccentKey === key ? "border-white" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
