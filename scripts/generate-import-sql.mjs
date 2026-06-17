import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "draws");
const OUTPUT = join(__dirname, "..", "data", "import_draws.sql");

const DENOMS = { "100": 100, "200": 200, "750": 750, "1500": 1500, "25000": 25000, "40000": 40000 };
const MONTHS = { jan:"01", feb:"02", mar:"03", apr:"04", may:"05", jun:"06", jul:"07", aug:"08", sep:"09", oct:"10", nov:"11", dec:"12" };
const PRIZE_AMOUNTS = {
  100: { first: 700000, second: 200000, third: 1000 },
  200: { first: 750000, second: 250000, third: 1250 },
  750: { first: 1500000, second: 500000, third: 9300 },
  1500: { first: 3000000, second: 1000000, third: 18500 },
  25000: { first: 30000000, second: 10000000, third: 300000 },
  40000: { first: 50000000, second: 10000000, third: 500000 },
};

let counter = 0;
function genId() {
  counter++;
  return "ext_" + counter.toString(36).padStart(6, "0");
}

function parseDate(filePath, text) {
  const fn = filePath.split("/").pop() || "";
  const fnMatch = fn.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (fnMatch) {
    const [, a, b, y] = fnMatch;
    if (parseInt(a) <= 31 && parseInt(b) <= 12) return `${a.padStart(2,"0")}-${b.padStart(2,"0")}-${y}`;
  }
  const fnMonth = fn.match(/(\d{1,2})[-\/.](\w{3,9})[-\/.](\d{4})/i);
  if (fnMonth) {
    const m = MONTHS[fnMonth[2].toLowerCase().slice(0, 3)];
    if (m) return `${fnMonth[1].padStart(2,"0")}-${m}-${fnMonth[3]}`;
  }
  return null;
}

function esc(s) { return (s || "").replace(/'/g, "''"); }

let sql = "-- Prize Bond Draws Import\nBEGIN TRANSACTION;\n\n";
let imported = 0;
let skipped = 0;

for (const [folder, denom] of Object.entries(DENOMS)) {
  const dir = join(DATA_DIR, folder);
  if (!existsSync(dir)) continue;
  const txtFiles = readdirSync(dir).filter(f => f.endsWith(".txt"));

  for (const f of txtFiles.sort()) {
    const filePath = join(dir, f);
    const text = readFileSync(filePath, "utf8");
    const date = parseDate(filePath, text);
    if (!date) { skipped++; continue; }

    const lines = text.split(/\r?\n/).filter(Boolean);
    const drawNumMatch = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:DRAW|draw)/i);
    const drawNum = drawNumMatch ? drawNumMatch[1] : null;
    const now = new Date().toISOString();
    const drawId = genId();

    sql += `-- ${f} (${date})\n`;
    sql += `INSERT OR IGNORE INTO draws (id, denomination, draw_number, draw_date, source, created_at, updated_at) VALUES ('${drawId}', ${denom}, ${drawNum ? `'${drawNum}'` : "NULL"}, '${date}', 'savings.gov.pk', '${now}', '${now}');\n`;

    const amounts = PRIZE_AMOUNTS[denom] || {};
    let currentPrize = null;
    const seen = new Set();

    for (const line of lines) {
      const pm = line.match(/^(First|Second|Third|Fourth|Fifth)\s+Prize/i);
      if (pm) { currentPrize = pm[1].toLowerCase(); continue; }
      if (!currentPrize) continue;
      const tokens = line.split(/\t|\s{3,}/).map(t => t.trim()).filter(Boolean);
      for (const t of tokens) {
        if (!/^\d+$/.test(t)) continue;
        const key = `${t}-${currentPrize}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const wid = genId();
        const amt = amounts[currentPrize] || 0;
        sql += `INSERT OR IGNORE INTO winning_numbers (id, draw_id, bond_number, prize_type, prize_amount, created_at) VALUES ('${wid}', '${drawId}', '${t}', '${currentPrize}', ${amt}, '${now}');\n`;
      }
    }

    imported++;
    sql += "\n";
  }
}

sql += "COMMIT;\n";
writeFileSync(OUTPUT, sql);

const size = (sql.length / 1024 / 1024).toFixed(1);
console.log(`Written ${imported} draws (${skipped} skipped) to ${OUTPUT} (${size} MB)`);
