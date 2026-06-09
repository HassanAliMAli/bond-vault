import { getDb } from "./db";

const db = getDb();

const DENOMINATIONS = ["100", "200", "750", "1500", "7500", "25000", "40000"];
const PRIZE_TIERS = [
  { type: "1st Prize", amount: "Rs. 15,000,000" },
  { type: "2nd Prize", amount: "Rs. 5,000,000" },
  { type: "3rd Prize", amount: "Rs. 1,000,000" },
];

function randomBondNumber(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function clearExisting() {
  db.prepare("DELETE FROM winning_numbers").run();
  db.prepare("DELETE FROM draws").run();
  console.log("Cleared existing draws and winning numbers");
}

function seed() {
  clearExisting();

  const insertDraw = db.prepare(
    "INSERT INTO draws (id, denomination, draw_date, draw_number) VALUES (?, ?, ?, ?)"
  );
  const insertWinning = db.prepare(
    "INSERT INTO winning_numbers (id, draw_id, bond_number, prize_type, prize_amount) VALUES (?, ?, ?, ?, ?)"
  );

  const insertAll = db.transaction(() => {
    let drawCount = 0;
    let winningCount = 0;

    for (const denom of DENOMINATIONS) {
      for (let month = 0; month < 12; month++) {
        const drawDate = `2026-${String(month + 1).padStart(2, "0")}-15`;
        const drawNumber = String(80 + month);
        const drawId = crypto.randomUUID();

        insertDraw.run(drawId, denom, drawDate, drawNumber);
        drawCount++;

        for (const tier of PRIZE_TIERS) {
          const count = tier.type === "1st Prize" ? 1 : tier.type === "2nd Prize" ? 5 : 50;
          for (let i = 0; i < count; i++) {
            const winningId = crypto.randomUUID();
            insertWinning.run(winningId, drawId, randomBondNumber(), tier.type, tier.amount);
            winningCount++;
          }
        }
      }
    }

    console.log(`Inserted ${drawCount} draws and ${winningCount} winning numbers`);
  });

  insertAll();
  console.log("Seed complete");
}

seed();
db.close();
