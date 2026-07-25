import type { NextApiRequest, NextApiResponse } from "next";
import { getClerkUserId } from "@/server/clerk-auth";
import { destroyLocalAsset } from "@/server/local-storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const ownerId = await getClerkUserId(req);
  if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ error: "publicId is required" });
  }

  try {
    await destroyLocalAsset(publicId);
    return res.status(200).json({ result: "ok" });
  } catch {
    return res.status(500).json({ error: "Failed to delete file" });
  }
}
