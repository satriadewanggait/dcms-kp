import type { NextApiRequest, NextApiResponse } from "next";

import { getServerAuthSession } from "@/server/auth";
import { destroyLocalAsset } from "@/server/local-storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const session = await getServerAuthSession({ req, res });
  if (!session?.user.id) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body as Record<string, unknown>;
  const publicId =
    typeof body.publicId === "string" ? body.publicId.trim() : "";
  if (!publicId) return res.status(400).json({ error: "publicId is required" });

  await destroyLocalAsset(publicId).catch(() => {});
  return res.status(200).json({ result: "ok" });
}
