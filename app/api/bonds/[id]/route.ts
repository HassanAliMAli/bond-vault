import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/auth-utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(req);
    const { id } = await params;
    const db = getDb();

    const bond = db
      .prepare("SELECT id, user_id FROM bonds WHERE id = ?")
      .get(id) as { id: string; user_id: string } | undefined;

    if (!bond) {
      return NextResponse.json({ error: "Bond not found" }, { status: 404 });
    }

    if (bond.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    db.prepare("DELETE FROM matches WHERE bond_id = ?").run(id);
    db.prepare("DELETE FROM bonds WHERE id = ?").run(id);

    return NextResponse.json({ success: true as const });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete bond" },
      { status: 500 }
    );
  }
}
