import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
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

  // Cek apakah user udah ada di DB
  let user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true, name: true, email: true },
  });

  // Kalo belum ada, fetch dari Clerk API & auto-create
  if (!user) {
    let name = "";
    let email = "";

    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      name =
        clerkUser.firstName ||
        clerkUser.lastName ||
        clerkUser.username ||
        "";
      email =
        clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    } catch {
      // Clerk API gagal — pake default aja
    }

    user = await db.user.create({
      data: {
        id: userId,
        name,
        email,
        role: "user",
        status: "pending", // nunggu approval admin
      },
      select: { role: true, status: true, name: true, email: true },
    });
  }

  return res.status(200).json({
    status: user.status,
    role: user.role,
  });
}
