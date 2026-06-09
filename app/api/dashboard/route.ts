import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const db = getDb();

    const { total: totalBonds } = db
      .prepare("SELECT COUNT(*) as total FROM bonds WHERE user_id = ?")
      .get(userId) as { total: number };

    const denominations = db
      .prepare(
        "SELECT denomination, COUNT(*) as count FROM bonds WHERE user_id = ? GROUP BY denomination ORDER BY CAST(denomination AS INTEGER) ASC"
      )
      .all(userId) as Array<{ denomination: string; count: number }>;

    const { total: totalMatches } = db
      .prepare(
        "SELECT COUNT(*) as total FROM matches WHERE user_id = ?"
      )
      .get(userId) as { total: number };

    const lastCheck = db
      .prepare(
        "SELECT MAX(matched_at) as lastCheck FROM matches WHERE user_id = ?"
      )
      .get(userId) as { lastCheck: string | null };

    const winners = db
      .prepare(
        `SELECT m.id, b.bond_number as bondNumber, b.denomination,
                wn.prize_type as prizeType, wn.prize_amount as prizeAmount,
                d.draw_date as drawDate
         FROM matches m
         JOIN bonds b ON m.bond_id = b.id
         JOIN winning_numbers wn ON m.winning_number_id = wn.id
         JOIN draws d ON wn.draw_id = d.id
         WHERE m.user_id = ?
         ORDER BY m.matched_at DESC
         LIMIT 10`
      )
      .all(userId) as Array<{
      id: string;
      bondNumber: string;
      denomination: string;
      prizeType: string;
      prizeAmount: string;
      drawDate: string;
    }>;

    const totalChecked = lastCheck.lastCheck ? totalBonds : totalBonds;

    return NextResponse.json({
      totalBonds,
      totalChecked: lastCheck.lastCheck ? totalBonds : 0,
      totalMatches,
      denominations,
      winners,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
