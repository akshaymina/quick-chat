// Central theme registry. Every theme is a set of Tailwind class strings
// (no inline hex/CSS outside of scrollbar vars, which Tailwind's core
// utilities can't reach without a plugin — see ThemeContext.jsx).
//
// To add a new theme later: add one entry here. No component files need
// to change, since every component reads colors from useTheme() instead
// of hardcoding Tailwind classes directly.
export const THEMES = {
  default: {
    name: "Default",
    swatch: "bg-gradient-to-br from-zinc-800 to-black",
    appBg: "bg-black",
    sidebarBg: "bg-black",
    headerBg: "bg-zinc-800",
    panelBg: "bg-zinc-900",
    bubbleSent: "bg-green-600",
    bubbleReceived: "bg-gray-700",
    inputBg: "bg-zinc-800",
    buttonPrimary: "bg-green-600 hover:bg-green-700",
    accentText: "text-green-500 hover:text-green-400",
    hoverBg: "hover:bg-zinc-200 hover:text-black",
    activeBg: "bg-zinc-200 text-black",
    scrollbarThumb: "#16a34a",
    scrollbarTrack: "#18181b",
  },
  dark: {
    name: "Dark",
    swatch: "bg-gradient-to-br from-neutral-700 to-neutral-950",
    appBg: "bg-neutral-950",
    sidebarBg: "bg-neutral-950",
    headerBg: "bg-neutral-900",
    panelBg: "bg-neutral-900",
    bubbleSent: "bg-neutral-600",
    bubbleReceived: "bg-neutral-800",
    inputBg: "bg-neutral-900",
    buttonPrimary: "bg-neutral-600 hover:bg-neutral-500",
    accentText: "text-neutral-300 hover:text-white",
    hoverBg: "hover:bg-neutral-800 hover:text-white",
    activeBg: "bg-neutral-800 text-white",
    scrollbarThumb: "#525252",
    scrollbarTrack: "#0a0a0a",
  },
  purple: {
    name: "Purple",
    swatch: "bg-gradient-to-br from-purple-500 to-[#1a0b2e]",
    appBg: "bg-[#1a0b2e]",
    sidebarBg: "bg-[#1a0b2e]",
    headerBg: "bg-[#2d1b4e]",
    panelBg: "bg-[#2d1b4e]",
    bubbleSent: "bg-purple-600",
    bubbleReceived: "bg-[#3b2a5c]",
    inputBg: "bg-[#2d1b4e]",
    buttonPrimary: "bg-purple-600 hover:bg-purple-700",
    accentText: "text-purple-400 hover:text-purple-300",
    hoverBg: "hover:bg-purple-900 hover:text-white",
    activeBg: "bg-purple-900 text-white",
    scrollbarThumb: "#9333ea",
    scrollbarTrack: "#1a0b2e",
  },
  discord: {
    name: "Discord",
    swatch: "bg-gradient-to-br from-[#5865F2] to-[#2b2d31]",
    appBg: "bg-[#313338]",
    sidebarBg: "bg-[#2b2d31]",
    headerBg: "bg-[#313338]",
    panelBg: "bg-[#2b2d31]",
    bubbleSent: "bg-[#5865F2]",
    bubbleReceived: "bg-[#404249]",
    inputBg: "bg-[#383a40]",
    buttonPrimary: "bg-[#5865F2] hover:bg-[#4752c4]",
    accentText: "text-[#5865F2] hover:text-[#4752c4]",
    hoverBg: "hover:bg-[#404249] hover:text-white",
    activeBg: "bg-[#404249] text-white",
    scrollbarThumb: "#1a1b1e",
    scrollbarTrack: "#2b2d31",
  },
  whatsapp: {
    name: "WhatsApp",
    swatch: "bg-gradient-to-br from-[#00a884] to-[#0b141a]",
    appBg: "bg-[#0b141a]",
    sidebarBg: "bg-[#111b21]",
    headerBg: "bg-[#202c33]",
    panelBg: "bg-[#202c33]",
    bubbleSent: "bg-[#005c4b]",
    bubbleReceived: "bg-[#202c33]",
    inputBg: "bg-[#2a3942]",
    buttonPrimary: "bg-[#00a884] hover:bg-[#06cf9c]",
    accentText: "text-[#00a884] hover:text-[#06cf9c]",
    hoverBg: "hover:bg-[#202c33] hover:text-white",
    activeBg: "bg-[#202c33] text-white",
    scrollbarThumb: "#374045",
    scrollbarTrack: "#0b141a",
  },
  // "Custom" reuses the default layout but lets the user swap the accent
  // from a preset palette (see CUSTOM_ACCENTS below). True arbitrary
  // runtime colors (e.g. a hex color picker) aren't achievable with
  // Tailwind utility classes alone — Tailwind compiles class names present
  // in source at BUILD time, so a class string built from a runtime value
  // like `bg-[${userHex}]` will not actually be generated/included in the
  // shipped CSS. Presets keep everything statically compilable while still
  // giving a "pick your own accent" experience.
  custom: {
    name: "Custom",
    swatch: "bg-gradient-to-br from-blue-500 to-black",
    appBg: "bg-black",
    sidebarBg: "bg-black",
    headerBg: "bg-zinc-800",
    panelBg: "bg-zinc-900",
    inputBg: "bg-zinc-800",
    hoverBg: "hover:bg-zinc-200 hover:text-black",
    activeBg: "bg-zinc-200 text-black",
    scrollbarTrack: "#18181b",
    // bubbleSent / buttonPrimary / accentText / scrollbarThumb are filled
    // in dynamically from CUSTOM_ACCENTS based on the user's picked preset.
  },
};

// Presets available for the "Custom" theme's accent color. Each maps to
// real, statically-present Tailwind classes so they always compile.
export const CUSTOM_ACCENTS = {
  blue: {
    label: "Blue",
    bubbleSent: "bg-blue-600",
    buttonPrimary: "bg-blue-600 hover:bg-blue-700",
    accentText: "text-blue-400 hover:text-blue-300",
    scrollbarThumb: "#2563eb",
  },
  pink: {
    label: "Pink",
    bubbleSent: "bg-pink-600",
    buttonPrimary: "bg-pink-600 hover:bg-pink-700",
    accentText: "text-pink-400 hover:text-pink-300",
    scrollbarThumb: "#db2777",
  },
  orange: {
    label: "Orange",
    bubbleSent: "bg-orange-600",
    buttonPrimary: "bg-orange-600 hover:bg-orange-700",
    accentText: "text-orange-400 hover:text-orange-300",
    scrollbarThumb: "#ea580c",
  },
  teal: {
    label: "Teal",
    bubbleSent: "bg-teal-600",
    buttonPrimary: "bg-teal-600 hover:bg-teal-700",
    accentText: "text-teal-400 hover:text-teal-300",
    scrollbarThumb: "#0d9488",
  },
  red: {
    label: "Red",
    bubbleSent: "bg-red-600",
    buttonPrimary: "bg-red-600 hover:bg-red-700",
    accentText: "text-red-400 hover:text-red-300",
    scrollbarThumb: "#dc2626",
  },
};

export const DEFAULT_THEME_KEY = "default";
export const DEFAULT_CUSTOM_ACCENT = "blue";
