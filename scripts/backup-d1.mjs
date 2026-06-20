const CF_API = "https://api.cloudflare.com/client/v4";
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const DB_ID = process.env.D1_DATABASE_ID;
const R2_BUCKET = process.env.R2_BUCKET_NAME || "bondvault-assets";
const TIMESTAMP = new Date().toISOString().split("T")[0];
const PREFIX = `backups/d1/${TIMESTAMP}`;

async function queryD1(sql) {
  const url = `${CF_API}/accounts/${CF_ACCOUNT}/d1/database/${DB_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`D1 query failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`D1 error: ${data.errors?.[0]?.message || "unknown"}`);
  }
  return data.result?.[0]?.results || [];
}

async function uploadToR2(key, data) {
  const url = `${CF_API}/accounts/${CF_ACCOUNT}/r2/buckets/${R2_BUCKET}/objects/${key}`;
  const body = JSON.stringify(data, null, 2);
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

async function main() {
  if (!CF_TOKEN || !CF_ACCOUNT || !DB_ID) {
    console.error("Missing CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, or D1_DATABASE_ID");
    process.exit(1);
  }

  console.log(`Backing up D1 database to R2 (${PREFIX})...`);

  const tables = await queryD1(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE '__drizzle%' ORDER BY name"
  );

  const tableNames = tables.map(t => t.name);
  console.log(`Found ${tableNames.length} tables: ${tableNames.join(", ")}`);

  let successCount = 0;
  for (const name of tableNames) {
    const rows = await queryD1(`SELECT * FROM "${name}"`);
    const ok = await uploadToR2(`${PREFIX}/${name}.json`, { table: name, exportedAt: TIMESTAMP, rows });
    if (ok) successCount++;
  }

  const manifest = {
    exportedAt: TIMESTAMP,
    databaseId: DB_ID,
    tables: tableNames,
    recordCounts: {},
  };
  for (const name of tableNames) {
    const rows = await queryD1(`SELECT COUNT(*) as count FROM "${name}"`);
    manifest.recordCounts[name] = rows[0]?.count || 0;
  }
  await uploadToR2(`${PREFIX}/manifest.json`, manifest);

  console.log(`Backup complete: ${successCount}/${tableNames.length} tables saved`);
}

main().catch((e) => {
  console.error("Backup failed:", e.message);
  process.exit(1);
});
