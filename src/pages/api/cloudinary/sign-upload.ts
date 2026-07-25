import type { NextApiRequest, NextApiResponse } from "next";
import { getClerkUserId } from "@/server/clerk-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const ownerId = await getClerkUserId(req);
  if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Cloudinary is deprecated — all files stored locally now
  return res.status(200).json({ timestamp: 0, signature: "" });
}
