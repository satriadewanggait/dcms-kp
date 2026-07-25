import type { NextApiRequest, NextApiResponse } from "next";
import { Webhook } from "svix";
import { db } from "@/server/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET?.trim() ?? "";

function buffer(readable: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readable.on("data", (chunk: Buffer) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ message: "Missing svix headers" });
  }

  let payload: Record<string, unknown>;
  try {
    const rawBody = await buffer(req);
    const rawStr = rawBody.toString("utf-8");
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(rawStr, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ message: "Invalid signature" });
  }

  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown> | undefined;

  if (!data) {
    return res.status(400).json({ message: "No data in payload" });
  }

  switch (eventType) {
    case "user.created":
    case "user.updated": {
      const clerkId = data.id as string;
      const emailAddr = data.email_addresses as Array<Record<string, unknown>> | undefined;
      const email = (emailAddr?.[0]?.email_address as string) ?? "";
      const name =
        (data.first_name as string) ||
        (data.last_name as string) ||
        (data.username as string) ||
        "";
      const image = (data.image_url as string) || null;

      await db.user.upsert({
        where: { id: clerkId },
        update: { name, email, image },
        create: { id: clerkId, name, email, image },
      });

      return res.status(200).json({ message: "User synced" });
    }

    case "user.deleted": {
      const clerkId = data.id as string;
      await db.user.delete({ where: { id: clerkId } }).catch(() => {});
      return res.status(200).json({ message: "User deleted" });
    }

    case "session.created":
    case "session.ended":
    case "session.revoked":
      return res.status(200).json({ message: "Ignored" });

    default:
      return res.status(200).json({ message: `Unhandled event: ${eventType}` });
  }
}
