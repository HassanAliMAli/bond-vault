import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "draws");
const AUTH = process.env.BETTER_AUTH_SECRET || "9cee1a2a2d6efb522ab4f5e0e128281ca23fb2ad185a2b9f733cbb618a7ff177";
const API = "https://bondvault.hassanali205031.workers.dev/api/v1/external/draws/import";

const DENOMS = { "100": 100, "200": 200, "750": 750, "1500": 1500, "25000": 25000, "40000": 40000 };

const MONTHS = { jan:"01", feb:"02", mar:"03", apr:"04", may:"05", jun:"06", jul:"07", aug:"08", sep:"09", oct:"10", nov:"11", dec:"12" };

function parseDate(filePath, text) {
  // From filename like "15-02-2024-Rs-100.txt" or "10-03-2022-Rs-25000-Premium.txt"
  const fn = filePath.split("/").pop() || "";
  const fnMatch = fn.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (fnMatch) {
    const [, a, b, y] = fnMatch;
    if (parseInt(a) <= 31 && parseInt(b) <= 12) return `${a.padStart(2,"0")}-${b.padStart(2,"0")}-${y}`;
  }

  // Filename with month name: "15-May-2025"
  const fnMonth = fn.match(/(\d{1,2})[-\/.](\w{3,9})[-\/.](\d{4})/i);
  if (fnMonth) {
    const m = MONTHS[fnMonth[2].toLowerCase().slice(0, 3)];
    if (m) return `${fnMonth[1].padStart(2,"0")}-${m}-${fnMonth[3]}`;
  }

  // From text: "Held on 16-02-2026" or "15-05-2024"
  const lines = text.split(/\r?\n/);
  for (const line of lines.slice(0, 10)) {
    const dm = line.match(/(\d{1,2})[-.](\d{1,2})[-.](\d{4})/);
    if (dm) {
      const [, a, b, y] = dm;
      if (parseInt(a) <= 31 && parseInt(b) <= 12) return `${a.padStart(2,"0")}-${b.padStart(2,"0")}-${y}`;
    }
  }
  return null;
}

function parseDrawNumber(text) {
  const m = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:DRAW|draw)/i);
  return m ? m[1] : null;
}

function parseWinningNumbers(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const winners = [];
  let currentPrize = null;

  for (const line of lines) {
    const pm = line.match(/^(First|Second|Third|Fourth|Fifth)\s+Prize/i);
    if (pm) {
      currentPrize = pm[1].toLowerCase();
      continue;
    }
    if (!currentPrize) continue;

    const tokens = line.split(/\t|\s{2,}/).map(t => t.trim()).filter(Boolean);
    for (const t of tokens) {
      if (/^\d+$/.test(t)) {
        winners.push({ bondNumber: t, prizeType: currentPrize, prizeAmount: null });
      }
    }
  }
  return winners;
}

async function importDraw(filePath, denom) {
  const text = readFileSync(filePath, "utf8");
  const date = parseDate(filePath, text);
  const drawNum = parseDrawNumber(text);
  const winners = parseWinningNumbers(text);

  if (!date) {
    console.log(`  SKIP ${filePath.split("/").pop()}: no date`);
    return false;
  }

  const body = {
    denomination: denom,
    drawNumber: drawNum,
    drawDate: date,
    source: "savings.gov.pk",
    winningNumbers: winners,
  };

  console.log(`  Import ${filePath.split("/").pop()} (${winners.length} winners, ${date})...`);
  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${AUTH}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  const status = result?.data?.status || `ERROR: ${result?.error?.message || "unknown"}`;
  if (status === "imported") console.log(`    -> IMPORTED`);
  else if (status === "already_exists") console.log(`    -> EXISTS`);
  else console.log(`    -> ${status}`);
  return true;
}

async function main() {
  let imported = 0;
  for (const [folder, denom] of Object.entries(DENOMS)) {
    const dir = join(DATA_DIR, folder);
    if (!existsSync(dir)) continue;
    const txtFiles = readdirSync(dir).filter(f => f.endsWith(".txt"));
    console.log(`\n=== ${folder} (${txtFiles.length} files) ===`);
    for (const f of txtFiles.sort()) {
      await importDraw(join(dir, f), denom);
      await new Promise(r => setTimeout(r, 300));
      imported++;
    }
  }
  console.log(`\nDone: ${imported} processed`);
}

main().catch(console.error);
