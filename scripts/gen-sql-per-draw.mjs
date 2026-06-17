import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "draws");
const SQL_DIR = join(__dirname, "..", "data", "sql_imports");

const MONTHS = { jan:"01", feb:"02", mar:"03", apr:"04", may:"05", jun:"06", jul:"07", aug:"08", sep:"09", oct:"10", nov:"11", dec:"12" };

const PRIZE_AMTS = {
  100: { f: 700000, s: 200000, t: 1000 },
  200: { f: 750000, s: 250000, t: 1250 },
  750: { f: 1500000, s: 500000, t: 9300 },
  1500: { f: 3000000, s: 1000000, t: 18500 },
  25000: { f: 30000000, s: 10000000, t: 300000 },
  40000: { f: 50000000, s: 10000000, t: 500000 },
};

let counter = 0;
function genId(denom) { counter++; return "ext_" + String(denom) + "_" + counter.toString(36).padStart(6, "0"); }

function esc(s) { return (s || "").replace(/'/g, "''"); }

mkdirSync(SQL_DIR, { recursive: true });

const completed = new Set();
let total = 0;

for (const denom of [100, 200, 750, 1500, 25000, 40000]) {
  const dir = join(DATA_DIR, String(denom));
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter(f => f.endsWith(".txt")).sort();

  for (const f of files) {
    const fp = join(dir, f);
    const txt = readFileSync(fp, "utf8");
    const fn = f;

    let date = null;
    const dm = fn.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
    if (dm && parseInt(dm[1]) <= 31 && parseInt(dm[2]) <= 12) {
      date = `${dm[1].padStart(2, "0")}-${dm[2].padStart(2, "0")}-${dm[3]}`;
    }
    if (!date) {
      const fm = fn.match(/(\d{1,2})[-\/.](\w{3,9})[-\/.](\d{4})/i);
      if (fm) {
        const m = MONTHS[fm[2].toLowerCase().slice(0, 3)];
        if (m) date = `${fm[1].padStart(2, "0")}-${m}-${fm[3]}`;
      }
    }
    if (!date) continue;

    const key = `${denom}_${date}`;
    if (completed.has(key)) continue;
    completed.add(key);

    const dnMatch = txt.match(/(\d+)(?:st|nd|rd|th)\s*(?:DRAW|draw)/i);
    const drawNum = dnMatch ? dnMatch[1] : null;
    const now = new Date().toISOString();
    const drawId = genId(denom);

    let sql = "";
    sql += `INSERT OR IGNORE INTO draws (id, denomination, draw_number, draw_date, source, created_at, updated_at) VALUES ('${drawId}', ${denom}, ${drawNum ? `'${esc(drawNum)}'` : "NULL"}, '${esc(date)}', 'savings.gov.pk', '${now}', '${now}');\n`;

    const amts = PRIZE_AMTS[denom] || {};
    let priority = null;
    const seen = new Set();

    for (const line of txt.split(/\r?\n/)) {
      const pm = line.match(/^(First|Second|Third|Fourth|Fifth)\s+Prize/i);
      if (pm) {
        const map = { first: "f", second: "s", third: "t" };
        priority = map[pm[1].toLowerCase()] || pm[1].toLowerCase();
        continue;
      }
      if (!priority) continue;
      for (const t of line.split(/\t|\s{3,}/).map(t => t.trim()).filter(Boolean)) {
        if (!/^\d+$/.test(t)) continue;
        const sk = `${t}_${priority}`;
        if (seen.has(sk)) continue;
        seen.add(sk);
        const wid = genId(denom);
        const amt = amts[priority] || 0;
        sql += `INSERT OR IGNORE INTO winning_numbers (id, draw_id, bond_number, prize_type, prize_amount, created_at) VALUES ('${wid}', '${drawId}', '${t}', '${priority}', ${amt}, '${now}');\n`;
      }
    }

    const sqlFile = join(SQL_DIR, `${denom}_${date.replace(/-/g, "_")}.sql`);
    writeFileSync(sqlFile, sql);
    total++;
  }
}

console.log(`Generated ${total} SQL files in ${SQL_DIR}`);
