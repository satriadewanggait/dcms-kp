import type { NextApiRequest, NextApiResponse } from "next";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { getServerAuthSession } from "@/server/auth";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerAuthSession({ req, res });
  if (!session?.user.id)
    return res.status(401).json({ error: "Unauthorized" });

  const { fileName, fileData } = req.body as {
    fileName?: string;
    fileData?: string;
  };
  if (!fileName || !fileData) {
    return res.status(400).json({ error: "fileName and fileData are required" });
  }

  const buffer = Buffer.from(fileData, "base64");
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", session.user.id);
  const filePath = path.join(uploadDir, safeName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  const url = `/uploads/${session.user.id}/${safeName}`;

  return res.status(200).json({
    url,
    publicId: url,
    resourceType: "raw",
  });
}
