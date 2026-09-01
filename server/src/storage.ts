import fs from "fs";
import path from "path";

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Saves an uploaded file under uploads/{challengeFolder}/{teamname}_{timestamp}.{ext}
 * and returns a URL path served by the /uploads static route.
 * Swap this implementation for an S3 SDK upload to move to production.
 */
export function saveUpload(challengeTitle: string, teamName: string, file: Express.Multer.File): string {
  const folder = sanitize(challengeTitle);
  const dir = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const ext = path.extname(file.originalname);
  const filename = `${sanitize(teamName)}_${Date.now()}${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);

  return `/uploads/${folder}/${filename}`;
}

export { UPLOAD_ROOT };
