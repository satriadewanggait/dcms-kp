import type { NextApiRequest, NextApiResponse } from "next";
import { getClerkUserId } from "@/server/clerk-auth";
import { storeLocalAssetFromBuffer } from "@/server/local-storage";
import formidable from "formidable";
import { readFile } from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const ownerId = await getClerkUserId(req);
  if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName =
      (fields.fileName?.[0]) ||
      uploadedFile.originalFilename ||
      "untitled";

    const buffer = await readFile(uploadedFile.filepath);
    const result = await storeLocalAssetFromBuffer(fileName, buffer, ownerId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ error: "Failed to store file" });
  }
}
