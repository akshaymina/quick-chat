// Single source of truth for the backend API base URL.
// - Set REACT_APP_API_URL in frontend/.env to point at a different backend.
// - In a production build served by the backend itself, default to the same
//   origin (the old default of localhost:8080 broke every deployed build).
export const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:8080");
