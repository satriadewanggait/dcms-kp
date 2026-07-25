import { unlink, writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Delete a local file stored via the local upload API.
 * The `publicId` is the URL path (e.g. `/uploads/{userId}/{filename}`).
 */
export const destroyLocalAsset = async (publicId: string) => {
  // publicId = "/uploads/{userId}/{filename}"
  // Resolve against `public/`
  const relativePath = publicId.startsWith("/") ? publicId.slice(1) : publicId;
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  await unlink(absolutePath);
};

const resourceTypeFromExt = (ext: string): string => {
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"];
  const videoExts = [".mp4", ".webm", ".avi"];
  const audioExts = [".mp3", ".wav", ".ogg"];
  if (imageExts.includes(ext.toLowerCase())) return "image";
  if (videoExts.includes(ext.toLowerCase())) return "video";
  if (audioExts.includes(ext.toLowerCase())) return "audio";
  return "raw";
};

/**
 * Store a file buffer to local storage.
 * Returns the URL path, public ID, and resource type.
 */
export const storeLocalAssetFromBuffer = async (
  fileName: string,
  buffer: Buffer,
  ownerId: string,
): Promise<{ url: string; publicId: string; resourceType: string }> => {
  const ext = path.extname(fileName) || ".bin";
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const relativeDir = `uploads/${ownerId}`;
  const relativePath = `${relativeDir}/${sanitizedName}`;
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    url: `/${relativePath}`,
    publicId: `/${relativePath}`,
    resourceType: resourceTypeFromExt(ext),
  };
};
