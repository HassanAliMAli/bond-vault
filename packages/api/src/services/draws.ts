import { generateId } from "../lib/id";

const DENOMINATIONS = [100, 200, 750, 1500, 7500, 25000, 40000];
const PRIZE_TIERS = [
  { type: "1st Prize", amount: 15000000 },
  { type: "2nd Prize", amount: 5000000 },
  { type: "3rd Prize", amount: 1000000 },
];

export async function seedDraws(d1: D1Database) {
  const db = d1;
  const existing = await db.prepare("SELECT COUNT(*) as count FROM draws").first<{ count: number }>();
  if (existing && existing.count > 0) {
    console.log(`${existing.count} draws already exist, skipping seed`);
    return;
  }

  let drawCount = 0;
  let winningCount = 0;

  for (const denom of DENOMINATIONS) {
    for (let month = 0; month < 12; month++) {
      const year = 2026;
      const drawDate = `${year}-${String(month + 1).padStart(2, "0")}-15`;
      const drawNumber = String(80 + month);
      const drawId = generateId();

      await db.prepare(
        "INSERT INTO draws (id, denomination, draw_date, draw_number, source) VALUES (?, ?, ?, ?, ?)"
      ).bind(drawId, denom, drawDate, drawNumber, "National Savings Pakistan").run();
      drawCount++;

      for (const tier of PRIZE_TIERS) {
        const count = tier.type === "1st Prize" ? 1 : tier.type === "2nd Prize" ? 5 : 50;
        for (let i = 0; i < count; i++) {
          const bondNumber = String(100000 + Math.floor(Math.random() * 900000));
          const winningId = generateId();
          await db.prepare(
            "INSERT INTO winning_numbers (id, draw_id, bond_number, prize_type, prize_amount) VALUES (?, ?, ?, ?, ?)"
          ).bind(winningId, drawId, bondNumber, tier.type, tier.amount).run();
          winningCount++;
        }
      }
    }
  }

  console.log(`Seeded ${drawCount} draws and ${winningCount} winning numbers`);
}
