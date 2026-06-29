import { unlink } from "fs/promises";
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
