import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

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

  const user = await db.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      role: "user",
      status: "pending",
    },
    select: { role: true, status: true },
  });

  return res.status(200).json({
    status: user.status,
    role: user.role,
  });
}
