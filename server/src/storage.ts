import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

const BUCKET = process.env.S3_BUCKET!;
const REGION = process.env.AWS_REGION ?? "us-east-1";

const s3 = new S3Client({ region: REGION });

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Uploads a file to S3 under {challengeFolder}/{teamname}_{timestamp}.{ext}
 * and returns the public HTTPS URL.
 */
export async function saveUpload(
  challengeTitle: string,
  teamName: string,
  file: Express.Multer.File
): Promise<string> {
  const folder = sanitize(challengeTitle);
  const ext = path.extname(file.originalname);
  const filename = `${sanitize(teamName)}_${Date.now()}${ext}`;
  const key = `${folder}/${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

// kept for index.ts import — no longer used for local serving
export const UPLOAD_ROOT = "";
