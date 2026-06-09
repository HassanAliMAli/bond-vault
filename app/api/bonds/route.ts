import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { bondSchema } from "@/lib/validations";
import { getUserId } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const url = req.nextUrl;
    const denomination = url.searchParams.get("denomination") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const sort = url.searchParams.get("sort") ?? "newest";

    const db = getDb();

    let query = "SELECT id, user_id, denomination, bond_number, created_at FROM bonds WHERE user_id = ?";
    const params: (string | number)[] = [userId];

    if (denomination) {
      query += " AND denomination = ?";
      params.push(denomination);
    }
    if (search) {
      query += " AND bond_number LIKE ?";
      params.push(`%${search}%`);
    }

    switch (sort) {
      case "oldest":
        query += " ORDER BY created_at ASC";
        break;
      case "denomination":
        query += " ORDER BY CAST(denomination AS INTEGER) ASC, created_at DESC";
        break;
      default:
        query += " ORDER BY created_at DESC";
    }

    const bonds = db.prepare(query).all(...params) as Array<{
      id: string;
      user_id: string;
      denomination: string;
      bond_number: string;
      created_at: string;
    }>;

    const countQuery = "SELECT COUNT(*) as total FROM bonds WHERE user_id = ?";
    const { total } = db.prepare(countQuery).get(userId) as { total: number };

    return NextResponse.json({ bonds, total });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Session expired") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch bonds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const parsed = bondSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { denomination, bond_number } = parsed.data;
    const db = getDb();

    const existing = db
      .prepare(
        "SELECT id FROM bonds WHERE user_id = ? AND denomination = ? AND bond_number = ?"
      )
      .get(userId, denomination, bond_number);

    if (existing) {
      return NextResponse.json(
        { error: "This bond already exists in your vault" },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO bonds (id, user_id, denomination, bond_number) VALUES (?, ?, ?, ?)"
    ).run(id, userId, denomination, bond_number);

    const bond = db
      .prepare("SELECT id, user_id, denomination, bond_number, created_at FROM bonds WHERE id = ?")
      .get(id) as {
      id: string;
      user_id: string;
      denomination: string;
      bond_number: string;
      created_at: string;
    };

    return NextResponse.json(bond, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create bond" }, { status: 500 });
  }
}
