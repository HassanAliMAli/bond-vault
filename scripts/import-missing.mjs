import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "draws");
const AUTH = process.env.BETTER_AUTH_SECRET || "9cee1a2a2d6efb522ab4f5e0e128281ca23fb2ad185a2b9f733cbb618a7ff177";
const API = "https://bondvault.hassanali205031.workers.dev/api/v1/external/draws/import";

const PRIZE_AMOUNTS = {
  100: { first: 700000, second: 200000, third: 1000 },
  200: { first: 750000, second: 250000, third: 1250 },
  750: { first: 1500000, second: 500000, third: 9300 },
  1500: { first: 3000000, second: 1000000, third: 18500 },
  25000: { first: 30000000, second: 10000000, third: 300000 },
  40000: { first: 50000000, second: 10000000, third: 500000 },
};

// Map of filename patterns to denom + date for files that can't auto-extract
const MANUAL_MAP = {
  "100/53-Draw-Result-of-Rs.-100-Denominatio.txt": "100/16-02-2026",
  "100/Draw-Result-100-50th.txt": "100/15-05-2025",
  "100/DRAW-RESULT-OF-RS.-100-DENOMINATIO.txt": "100/15-08-2025",
  "100/Draw-Result-of-Rs.-100-Denominatio.txt-2025.txt": "100/17-11-2025",
  "100/Rs-100-Prize-Bond-Draw-May-2026.txt": "100/15-05-2026",
  "100/Rs.100-49th-Draw-RWP-Final.txt": "100/17-02-2025",
  "200/105th-draw-of-Prize-Bond-Rs.200-d.txt": "200/16-03-2026",
  "200/DRAW-RESULT-OF-Rs.200-DENOMINATION.txt": "200/15-09-2025",
  "200/104-DRAW-RESULT-OF-RS.200-DENOMINATION.txt": "200/15-12-2025",
  "200/Prize-200-101-draw-17-March.txt": "200/17-03-2025",
  "200/Revised-Draw-Result-of-Rs.-200-Denominatio.txt": "200/15-12-2025",
  "750/DRAW-RESULT-OF-RS.-750-DENOMINATION-105.txt": "750/15-01-2026",
  "750/DRAW-RESULT-OF-Rs.750-DENOMINATION.txt": "750/15-04-2026",
  "750/Rs-750-101Draw.txt": "750/15-01-2025",
  "750/Rs-750-Draw-103-1.txt": "750/15-07-2025",
  "750/750-october-file.txt": "750/15-10-2025",
  "1500/105-DRAW-RESULT-OF-RS.1500-DENOMINATIO.txt": "1500/17-02-2026",
  "1500/DRAW-RESULT-OF-RS.1500-DENOMINATIO.txt": "1500/15-05-2026",
  "1500/DRAW-RESULT-OF-Rs.1500-DENOMINATI.txt-15-May.txt": "1500/15-05-2025",
  "1500/DRAW-RESULT-OF-RS.1500-DENOMINATIon-15-augtxt.txt": "1500/15-08-2025",
  "25000/DRAW-RESULT-OF-17-RS.25000-DENOMINAT.txt": "25000/10-03-2025",
  "25000/DRAW-RESULT-OF-18-RS.-25000-DENOMINA.txt": "25000/10-06-2025",
  "25000/March-DRAW-RESULT-OF-Rs.25000-DENOMINATI.txt": "25000/10-03-2026",
  "25000/Draw-Result-of-Rs.25000-Denominati.txt-10-dec.txt": "25000/10-12-2025",
  "40000/March-DRAW-RESULT-OF-RS.-40000-DENOMINA.txt": "40000/10-03-2026",
  "40000/32-draw-rs-40000-Premium.txt": "40000/10-03-2025",
  "40000/Copy-of-31st-Draw-list-PPB-40K.txt": "40000/10-12-2024",
  "40000/Draw-Result-of-33-Rs.-40-000-Denomin.txt": "40000/10-06-2025",
};

function parseWinners(text, denom) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const winners = [];
  let currentPrize = null;
  for (const line of lines) {
    const pm = line.match(/^(First|Second|Third|Fourth|Fifth)\s+Prize/i);
    if (pm) {
      currentPrize = { first: "f", second: "s", third: "t", fourth: "fourth", fifth: "fifth" }[pm[1].toLowerCase()];
      continue;
    }
    if (!currentPrize) continue;
    const tokens = line.split(/\t|\s{3,}/).map(t => t.trim()).filter(Boolean);
    for (const t of tokens) {
      if (/^\d+$/.test(t)) winners.push({ bondNumber: t, prizeType: currentPrize });
    }
  }
  return winners;
}

async function main() {
  let imported = 0, exists = 0, failed = 0;

  for (const [fileKey, mapping] of Object.entries(MANUAL_MAP)) {
    const [denomFolder, date] = mapping.split("/");
    const filePath = join(DATA_DIR, fileKey);

    if (!existsSync(filePath)) {
      console.log(`SKIP ${fileKey}: not found`);
      continue;
    }

    const text = readFileSync(filePath, "utf8");
    const drawNumMatch = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:DRAW|draw)/i);
    const drawNum = drawNumMatch ? drawNumMatch[1] : null;
    const winners = parseWinners(text, parseInt(denomFolder));
    const denom = parseInt(denomFolder);

    const body = {
      denomination: denom,
      drawNumber: drawNum,
      drawDate: date,
      source: "savings.gov.pk",
      winningNumbers: winners,
    };

    process.stdout.write(`${fileKey} → ${date} (${winners.length} winners)... `);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${AUTH}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      const status = result?.data?.status || `ERROR: ${result?.error?.message || "?"}`;
      if (status === "imported") { console.log("IMPORTED"); imported++; }
      else if (status === "already_exists") { console.log("EXISTS"); exists++; }
      else { console.log(status); failed++; }
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone: ${imported} imported, ${exists} existed, ${failed} failed`);
}

main().catch(console.error);
