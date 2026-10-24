// Loads environment variables from a .env file regardless of which directory
// the server was launched from (root `npm run dev` or `cd backend`).
// Import this FIRST in index.js. ESM hoists imports, so calling
// dotenv.config() in the body of index.js runs AFTER every other module
// has already been evaluated.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/.env first, then project-root .env as a fallback.
// dotenv never overrides a variable that is already set.
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
