import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (db) {
      await db.execute(sql`select 1`);
      return Response.json({ ok: true, db: "connected" });
    }
    return Response.json({ ok: true, db: "not_configured" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
