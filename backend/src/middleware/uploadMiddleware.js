import multer from "multer";
import path from "path";
import fs from "fs";

// Absolute path, not relative — relative "uploads/" resolves against
// whatever the process's current working directory happens to be at
// launch time, which breaks if the server is ever started from a
// different directory (process manager, Docker, monorepo script, etc).
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 500MB cap. Without a limit, multer accepts a file of any size, which
// means a single bad/oversized upload can fill the server's disk.
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("audio/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video/audio files are allowed"));
    }
  },
});

export default upload;
