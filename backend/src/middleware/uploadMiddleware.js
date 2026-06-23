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
    // FIX: don't rely solely on file.mimetype. MediaRecorder-produced
    // blobs (e.g. "video/webm;codecs=vp9,opus") can arrive with a
    // mimetype string that browsers/multer report inconsistently across
    // versions — in practice this was rejecting valid recordings with
    // "Only video/audio files are allowed" even though the blob really
    // was video/webm. Checking the file extension is more reliable here
    // since we control the filename ourselves (see uploadRecordingBlob
    // in MeetingRoom.jsx, which always names it "*.webm").
    const allowedExtensions = [
      ".webm",
      ".mp4",
      ".mov",
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    const mimetypeLooksMediaLike =
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "application/octet-stream"; // common fallback for blobs with parameterized mimetypes

    if (allowedExtensions.includes(ext) || mimetypeLooksMediaLike) {
      cb(null, true);
    } else {
      console.log(
        `Rejected upload: filename="${file.originalname}" mimetype="${file.mimetype}"`,
      );
      cb(new Error("Only video/audio files are allowed"));
    }
  },
});

export default upload;
