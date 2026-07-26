import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Cek apakah admin
  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }

  // GET — list semua user
  if (req.method === "GET") {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(users);
  }

  // POST — approve / reject / change role
  if (req.method === "POST") {
    const { targetUserId, action, role } = req.body as {
      targetUserId?: string;
      action?: "approve" | "reject" | "inactivate";
      role?: string;
    };

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    if (action === "approve") {
      const newRole = role ?? "user";

      await db.user.update({
        where: { id: targetUserId },
        data: { status: "active", role: newRole },
      });

      // Sync ke Clerk public_metadata
      const client = await clerkClient();
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: { role: newRole, status: "active" },
      });

      return res.status(200).json({ message: "User approved" });
    }

    if (action === "reject") {
      await db.user.update({
        where: { id: targetUserId },
        data: { status: "rejected" },
      });

      const client = await clerkClient();
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: { status: "rejected" },
      });

      return res.status(200).json({ message: "User rejected" });
    }

    if (action === "inactivate") {
      await db.user.update({
        where: { id: targetUserId },
        data: { status: "inactive" },
      });

      const client = await clerkClient();
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: { status: "inactive" },
      });

      return res.status(200).json({ message: "User deactivated" });
    }

    return res.status(400).json({ message: "Invalid action" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
