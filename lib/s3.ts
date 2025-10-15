import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { PutObjectCommandInput, ObjectCannedACL } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "eu-north-1";
const bucket = process.env.S3_BUCKET || "";

export const s3 = new S3Client({
  region,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function uploadBufferToS3(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!bucket) throw new Error("S3_BUCKET not set");
  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  };
  const acl = (process.env.S3_ACL as ObjectCannedACL) || ("public-read" as ObjectCannedACL);
  input.ACL = acl;
  await s3.send(new PutObjectCommand(input));

  const base = process.env.S3_PUBLIC_BASE_URL || `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${base}/${key}`;
}


