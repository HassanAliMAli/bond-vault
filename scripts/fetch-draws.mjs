import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseDrawFile, filenameToDrawKey, denomFolderName } from "./parse-draw.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data", "draws");
const BASE_URL = "https://savings.gov.pk";

const DENOMS = {
  "100": "rs-100-prize-bond-draw",
  "200": "rs-200-prize-bond-draw",
  "750": "rs-750-prize-bond-draw",
  "1500": "rs-1500-prize-bond-draw",
  "25000": "premium-prize-bond-rs-25000",
  "40000": "premium-prize-bond-rs-40000",
};

const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";
const R2_BUCKET = process.env.R2_BUCKET_NAME || "bondvault-assets";
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const APP_URL = process.env.APP_URL || "https://bondvault.hassanali205031.workers.dev";
const AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

async function uploadToR2(key, jsonData) {
  if (!CF_TOKEN || !CF_ACCOUNT) {
    console.log(`  [R2] Skipped (no credentials): ${key}`);
    return false;
  }
  const url = `${CLOUDFLARE_API}/accounts/${CF_ACCOUNT}/r2/buckets/${R2_BUCKET}/objects/${key}`;
  const body = JSON.stringify(jsonData);
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  [R2] FAILED (${res.status}): ${key} — ${err}`);
    return false;
  }
  console.log(`  [R2] Uploaded: ${key}`);
  return true;
}

async function fetchPage(slug) {
  const url = `${BASE_URL}/${slug}/`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BondVault/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return await res.text();
}

function extractLinks(html) {
  const links = [];
  const regex = /href="([^"]*\.(?:pdf|txt))"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)];
}

function isRecent(yearStr) {
  const year = parseInt(yearStr, 10);
  return year >= 2020 && year <= 2030;
}

async function downloadFile(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BondVault/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer;
}

async function importToD1(parsed) {
  if (!AUTH_SECRET) {
    console.log(`  [D1] Skipped (no BETTER_AUTH_SECRET)`);
    return false;
  }
  try {
    const res = await fetch(`${APP_URL}/api/v1/external/draws/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed),
    });
    const data = await res.json();
    if (data?.success) {
      const status = data?.data?.status;
      console.log(`  [D1] ${status === "already_exists" ? "Already exists" : `Imported (id: ${data.data.id})`}`);
    } else {
      console.error(`  [D1] Failed: ${data?.error?.message || res.status}`);
    }
    return data?.success;
  } catch (e) {
    console.error(`  [D1] Error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("===== Fetching Prize Bond Draws =====\n");
  const allUploads = [];

  for (const [denom, slug] of Object.entries(DENOMS)) {
    console.log(`--- Rs. ${denom} ---`);
    let html;
    try {
      html = await fetchPage(slug);
    } catch (e) {
      console.error(`  ERROR fetching ${slug}: ${e.message}`);
      continue;
    }

    const links = extractLinks(html);
    const recentLinks = links.filter((l) => {
      const yearMatch = l.match(/(20[2-9]\d)/);
      return yearMatch && isRecent(yearMatch[1]);
    });

    console.log(`  Found ${links.length} files, ${recentLinks.length} from 2020+`);

    const denomDir = join(DATA_DIR, denomFolderName(denom));
    mkdirSync(denomDir, { recursive: true });

    for (const url of recentLinks) {
      if (!url.endsWith(".txt")) continue;

      const filename = url.split("/").pop();
      const localPath = join(denomDir, filename);

      if (existsSync(localPath) && readFileSync(localPath).length > 0) {
        console.log(`  [SKIP] ${filename} (already downloaded)`);
        continue;
      }

      console.log(`  [DL] ${filename}`);
      let buffer;
      try {
        buffer = await downloadFile(url);
      } catch (e) {
        console.error(`  [FAIL] ${filename}: ${e.message}`);
        continue;
      }

      writeFileSync(localPath, buffer);
      console.log(`  [SAVED] ${localPath}`);

      try {
        const parsed = parseDrawFile(localPath);
        const drawKey = filenameToDrawKey(parsed.denomination, parsed.drawDate, parsed.drawNumber);
        const r2Key = drawKey;
        const jsonPath = join(DATA_DIR, parsed.denomination ?? "unknown", `${parsed.drawDate || "unknown"}${parsed.drawNumber ? `-draw-${parsed.drawNumber}` : ""}.json`);
        mkdirSync(dirname(jsonPath), { recursive: true });
        writeFileSync(jsonPath, JSON.stringify(parsed, null, 2));
        console.log(`  [PARSED] ${parsed.winningNumbers.length} winning numbers → ${r2Key}`);

        // Upload to R2
        const uploaded = await uploadToR2(r2Key, parsed);
        if (uploaded) allUploads.push(r2Key);

        // Import into D1 database (for matching engine)
        await importToD1(parsed);
      } catch (e) {
        console.error(`  [PARSE FAIL] ${filename}: ${e.message}`);
      }

      // Delay to be respectful
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Write index of all available draws
  const allDenoms = ["100", "200", "750", "1500", "25000", "40000"];
  const index = [];
  for (const dir of allDenoms) {
    const dirPath = join(DATA_DIR, dir);
    if (!existsSync(dirPath)) continue;
    const files = readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      try {
        const content = JSON.parse(readFileSync(join(dirPath, f), "utf8"));
        index.push({
          key: `draws/${dir}/${f}`,
          denomination: content.denomination,
          drawNumber: content.drawNumber,
          drawDate: content.drawDate,
          totalWinners: content.winningNumbers.length,
        });
      } catch {}
    }
  }

  if (index.length > 0) {
    const indexPath = join(DATA_DIR, "index.json");
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`\n[INDEX] Written ${index.length} draws to ${indexPath}`);

    const indexUploaded = await uploadToR2("draws/index.json", index);
    if (indexUploaded) allUploads.push("draws/index.json");
  }

  console.log(`\n===== Done. ${allUploads.length} files uploaded to R2 =====`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
