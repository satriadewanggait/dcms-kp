import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // POST — share file dengan user lain
  if (req.method === "POST") {
    const { fileId, targetUserId } = req.body as {
      fileId?: string;
      targetUserId?: string;
    };

    if (!fileId || !targetUserId) {
      return res
        .status(400)
        .json({ message: "fileId and targetUserId are required" });
    }

    // Cek file exists dan milik user ini
    const file = await db.fileEntry.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Cek user target exists
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.status !== "active") {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Cegah share ke diri sendiri
    if (targetUserId === userId) {
      return res.status(400).json({ message: "Cannot share with yourself" });
    }

    // Cek apakah udah pernah di-share
    const existing = await db.sharedFile.findUnique({
      where: {
        fileId_sharedWithId: {
          fileId,
          sharedWithId: targetUserId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: "Already shared with this user" });
    }

    // Create share
    const share = await db.sharedFile.create({
      data: {
        fileId,
        sharedWithId: targetUserId,
        sharedById: userId,
      },
    });

    return res.status(201).json(share);
  }

  // DELETE — hapus share
  if (req.method === "DELETE") {
    const { fileId, targetUserId } = req.query as {
      fileId?: string;
      targetUserId?: string;
    };

    if (!fileId || !targetUserId) {
      return res
        .status(400)
        .json({ message: "fileId and targetUserId are required" });
    }

    // Cek file exists dan milik user ini
    const file = await db.fileEntry.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await db.sharedFile.deleteMany({
      where: { fileId, sharedWithId: targetUserId },
    });

    return res.status(200).json({ message: "Share removed" });
  }

  // GET — dapatkan list user yang diajak share untuk file tertentu
  if (req.method === "GET") {
    const { fileId } = req.query as { fileId?: string };

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    const shares = await db.sharedFile.findMany({
      where: { fileId },
      include: {
        sharedWith: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json(shares);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
