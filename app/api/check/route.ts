import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const db = getDb();

    const bonds = db
      .prepare(
        "SELECT id, denomination, bond_number FROM bonds WHERE user_id = ?"
      )
      .all(userId) as Array<{
      id: string;
      denomination: string;
      bond_number: string;
    }>;

    if (bonds.length === 0) {
      return NextResponse.json({ matches: [], totalChecked: 0 });
    }

    const insertMatch = db.prepare(
      "INSERT OR IGNORE INTO matches (id, user_id, bond_id, winning_number_id) VALUES (?, ?, ?, ?)"
    );

    let newMatchCount = 0;

    const findMatchStmt = db.prepare(
      `SELECT wn.id as winningId, wn.prize_type as prizeType,
              wn.prize_amount as prizeAmount, d.draw_date as drawDate,
              d.draw_number as drawNumber, wn.bond_number as winningBondNumber
       FROM winning_numbers wn
       JOIN draws d ON wn.draw_id = d.id
       WHERE d.denomination = ? AND wn.bond_number = ?`
    );

    const insertMany = db.transaction(() => {
      for (const bond of bonds) {
        const match = findMatchStmt.get(
          bond.denomination,
          bond.bond_number
        ) as
          | {
              winningId: string;
              prizeType: string;
              prizeAmount: string;
              drawDate: string;
              drawNumber: string;
              winningBondNumber: string;
            }
          | undefined;

        if (match) {
          const result = insertMatch.run(
            crypto.randomUUID(),
            userId,
            bond.id,
            match.winningId
          );
          if (result.changes > 0) newMatchCount++;
        }
      }
    });

    insertMany();

    const matches = db
      .prepare(
        `SELECT m.id, b.bond_number as bondNumber, b.denomination,
                wn.prize_type as prizeType, wn.prize_amount as prizeAmount,
                d.draw_date as drawDate, d.draw_number as drawNumber
         FROM matches m
         JOIN bonds b ON m.bond_id = b.id
         JOIN winning_numbers wn ON m.winning_number_id = wn.id
         JOIN draws d ON wn.draw_id = d.id
         WHERE m.user_id = ?
         ORDER BY m.matched_at DESC`
      )
      .all(userId) as Array<{
      id: string;
      bondNumber: string;
      denomination: string;
      prizeType: string;
      prizeAmount: string;
      drawDate: string;
      drawNumber: string;
    }>;

    return NextResponse.json({
      matches,
      totalChecked: bonds.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to check bonds" },
      { status: 500 }
    );
  }
}
