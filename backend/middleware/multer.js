import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// BUGFIX: process.cwd() depends on the directory the process was *launched*
// from, not where this file lives — that mismatch is what created the stray
// backend/backend/uploads/ folder previously. Deriving the path from this
// module's own location makes it launch-directory independent.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize: strip path separators and anything but safe filename
        // characters so a crafted originalname can't traverse directories
        // or collide with control characters.
        const safeName = file.originalname
            .replace(/[/\\]/g, "")
            .replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueName = `${Date.now()}-${safeName}`;
        cb(null, uniqueName);
    }
});

// Allowlist: images + a few common document/attachment types.
// Extend this list deliberately if you need to support more formats —
// never allow executable, script, or markup mimetypes (.exe, .html, .svg,
// .php) since uploads are served back out statically from /uploads.
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "application/pdf",
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
]);

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
    },
});
