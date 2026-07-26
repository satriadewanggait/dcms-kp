import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { serializeFileEntry } from "@/server/files";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Ambil file yang pernah di-share oleh user ini ke orang lain
  const shares = await db.sharedFile.findMany({
    where: { sharedById: userId },
    include: {
      file: true,
      sharedWith: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by file, kumpulin siapa aja yang di-share
  const fileMap = new Map<
    string,
    {
      file: ReturnType<typeof serializeFileEntry>;
      sharedWith: { id: string; name: string | null; email: string | null }[];
    }
  >();

  for (const share of shares) {
    if (!fileMap.has(share.fileId)) {
      fileMap.set(share.fileId, {
        file: serializeFileEntry(share.file),
        sharedWith: [],
      });
    }
    fileMap.get(share.fileId)!.sharedWith.push(share.sharedWith);
  }

  const result = Array.from(fileMap.values());

  return res.status(200).json(result);
}
