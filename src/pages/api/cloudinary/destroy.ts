import type { NextApiRequest, NextApiResponse } from "next";
import { getClerkUserId } from "@/server/clerk-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const ownerId = await getClerkUserId(req);
  if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

  const { publicId, resourceType } = req.body;
  if (!publicId || !resourceType) {
    return res.status(400).json({ error: "publicId and resourceType are required" });
  }

  // Cloudinary is deprecated — all files stored locally now
  return res.status(200).json({ result: "ok" });
}
