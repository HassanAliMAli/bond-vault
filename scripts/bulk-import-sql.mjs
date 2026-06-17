import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "draws");
const PROJ_DIR = join(__dirname, "..");
const DB_NAME = "bondvault-production-v2";

function runSql(sql) {
  try {
    const out = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      cwd: PROJ_DIR,
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return out.toString();
  } catch (e) {
    return `ERROR: ${e.message}`;
  }
}

function genId() {
  return "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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

function parseDrawNumber(text) {
  const m = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:DRAW|draw)/i);
  return m ? m[1] : null;
}

function parseWinners(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const winners = [];
  let currentPrize = null;
  for (const line of lines) {
    const pm = line.match(/^(First|Second|Third|Fourth|Fifth)\s+Prize/i);
    if (pm) { currentPrize = pm[1].toLowerCase(); continue; }
    if (!currentPrize) continue;
    const tokens = line.split(/\t|\s{2,}/).map(t => t.trim()).filter(Boolean);
    for (const t of tokens) {
      if (/^\d+$/.test(t)) winners.push({ bondNumber: t, prizeType: currentPrize });
    }
  }
  return winners;
}

async function main() {
  let totalImported = 0;
  let totalSkipped = 0;

  for (const [folder, denom] of Object.entries(DENOMS)) {
    const dir = join(DATA_DIR, folder);
    if (!existsSync(dir)) continue;
    const txtFiles = readdirSync(dir).filter(f => f.endsWith(".txt"));

    for (const f of txtFiles.sort()) {
      const filePath = join(dir, f);
      const text = readFileSync(filePath, "utf8");
      const date = parseDate(filePath, text);
      const drawNum = parseDrawNumber(text);
      const winners = parseWinners(text);

      if (!date) {
        console.log(`SKIP ${f}: no date`);
        totalSkipped++;
        continue;
      }

      // Check if already exists
      const checkSql = `SELECT id FROM draws WHERE denomination=${denom} AND drawDate='${date}'`;
      const checkResult = runSql(checkSql);
      if (checkResult && !checkResult.includes("ERROR") && checkResult.includes('"results"')) {
        try {
          const parsed = JSON.parse(checkResult.slice(checkResult.indexOf("["), checkResult.lastIndexOf("]") + 1));
          if (parsed.length > 0) {
            console.log(`EXISTS ${f} (${date})`);
            totalSkipped++;
            continue;
          }
        } catch {}
      }

      const drawId = genId();
      const now = new Date().toISOString();
      const drawSql = `INSERT INTO draws (id, denomination, draw_number, draw_date, source, created_at, updated_at) VALUES ('${drawId}', ${denom}, ${drawNum ? `'${drawNum}'` : "NULL"}, '${date}', 'savings.gov.pk', '${now}', '${now}')`;
      runSql(drawSql);

      const amounts = PRIZE_AMOUNTS[denom] || {};
      let batchSql = "";
      let batchCount = 0;
      const seen = new Set();

      for (const w of winners) {
        const key = `${w.bondNumber}-${w.prizeType}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const id = genId();
        const amount = amounts[w.prizeType] || 0;
        batchSql += `INSERT INTO winning_numbers (id, draw_id, bond_number, prize_type, prize_amount, created_at) VALUES ('${id}', '${drawId}', '${w.bondNumber}', '${w.prizeType}', ${amount}, '${now}');\n`;
        batchCount++;
      }

      if (batchCount > 0) {
        runSql(batchSql);
      }

      console.log(`IMPORTED ${f} (${batchCount} winners, ${date})`);
      totalImported++;
    }
  }

  console.log(`\nDone: ${totalImported} imported, ${totalSkipped} skipped`);
}

main().catch(console.error);
