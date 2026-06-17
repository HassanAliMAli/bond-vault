import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "draws");
const AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "9cee1a2a2d6efb522ab4f5e0e128281ca23fb2ad185a2b9f733cbb618a7ff177";
const APP_URL = process.env.APP_URL || "https://bondvault.hassanali205031.workers.dev";
const API = `${APP_URL}/api/v1/external/draws/import`;

const MONTH_NAMES = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function extractDateFromText(text, filePath) {
  const datePatterns = [
    /(?:Held on|held on)\s+(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
  ];

  for (const pat of datePatterns) {
    const m = text.match(pat);
    if (m) {
      let [, dd, mm, yyyy] = m;
      yyyy = yyyy.length === 2 ? `20${yyyy}` : yyyy;
      if (parseInt(m[1], 10) <= 31 && parseInt(m[2], 10) <= 12) {
        return `${dd.padStart(2, "0")}-${mm.padStart(2, "0")}-${yyyy}`;
      }
      if (parseInt(m[2], 10) <= 31 && parseInt(m[1], 10) <= 12) {
        return `${mm.padStart(2, "0")}-${dd.padStart(2, "0")}-${yyyy}`;
      }
    }
  }

  // Try filename with month names like "15-May-2025"
  const fnMatch = filePath.match(/(\d{1,2})[-\/.](\w{3,9})[-\/.](\d{4})/i);
  if (fnMatch) {
    const monthNum = MONTH_NAMES[fnMatch[2].toLowerCase().slice(0, 3)];
    if (monthNum) {
      return `${fnMatch[1].padStart(2, "0")}-${monthNum}-${fnMatch[3]}`;
    }
  }

  return null;
}

async function main() {
  const denoms = ["100", "200", "750", "1500", "25000", "40000"];
  let imported = 0;
  let skipped = 0;

  for (const denom of denoms) {
    const dir = join(DATA_DIR, denom);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "index.json");

    for (const file of files) {
      const filePath = join(dir, file);
      const data = JSON.parse(readFileSync(filePath, "utf8"));

      if (!data.denomination || !data.drawDate) {
        // Try to fix missing fields
        if (!data.drawDate) {
          const txtFile = join(dir, file.replace(".json", ".txt"));
          if (existsSync(txtFile)) {
            const text = readFileSync(txtFile, "utf8");
            const date = extractDateFromText(text, filePath);
            if (date) data.drawDate = date;
          }
          if (!data.drawDate) {
            const date = extractDateFromText("", filePath);
            if (date) data.drawDate = date;
          }
        }
        if (!data.denomination) {
          data.denomination = parseInt(denom, 10);
        }
      }

      if (!data.denomination || !data.drawDate) {
        console.log(`SKIP ${denom}/${file}: missing denom=${data.denomination} date=${data.drawDate}`);
        continue;
      }

      console.log(`IMPORT ${denom}/${file} (${data.winningNumbers.length} winners, date=${data.drawDate})...`);

      try {
        const res = await fetch(API, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AUTH_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result?.data?.status === "imported") {
          console.log(`  -> IMPORTED`);
          imported++;
        } else if (result?.data?.status === "already_exists") {
          console.log(`  -> EXISTS`);
          skipped++;
        } else {
          console.log(`  -> FAIL: ${result?.error?.message || JSON.stringify(result)}`);
        }
      } catch (e) {
        console.log(`  -> ERROR: ${e.message}`);
      }

      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} already existed`);
}

main().catch(console.error);
