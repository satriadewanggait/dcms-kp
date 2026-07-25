import type { NextApiRequest } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

/**
 * Helper untuk dapetin userId dari Clerk di API Routes.
 * Otomatis fallback kalo user belum ada di DB (misal webhook belum keproses).
 */
export async function getClerkUserId(
  req: NextApiRequest,
): Promise<string | null> {
  const { userId } = getAuth(req);
  return userId ?? null;
}

/**
 * Dapetin user dari Prisma berdasarkan Clerk userId.
 */
export async function getClerkUser(req: NextApiRequest) {
  const userId = await getClerkUserId(req);
  if (!userId) return null;

  const user = await db.user.findUnique({ where: { id: userId } });
  return user;
}
