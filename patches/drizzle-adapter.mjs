import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Patch the nested copy under better-auth/node_modules (the one actually used)
const paths = [
  "node_modules/better-auth/node_modules/@better-auth/drizzle-adapter/dist/index.mjs",
  "node_modules/@better-auth/drizzle-adapter/dist/index.mjs",
];

for (const relative of paths) {
  const filePath = resolve(root, relative);
  try {
    let content = readFileSync(filePath, "utf8");
    const original = content;

    // Add supportsDates: false and camelCase: true to adapter config
    content = content.replace(
      'supportsArrays: config.provider === "pg" ? true : false,',
      'supportsArrays: config.provider === "pg" ? true : false,\n\t\t\tsupportsDates: false,\n\t\t\tcamelCase: true,'
    );

    content = content.replace(
      /function checkMissingFields\(schema,\s*model,\s*values\)\s*\{[\s\S]*?^		\}/m,
      `function checkMissingFields(schema, model, values) {
			if (!schema) throw new BetterAuthError("Drizzle adapter failed to initialize. Drizzle Schema not found. Please provide a schema object in the adapter options object.");
		}`
    );

    if (content !== original) {
      writeFileSync(filePath, content, "utf8");
      console.log(`[postinstall] Patched ${relative}`);
    } else {
      console.log(`[postinstall] Already patched ${relative}`);
    }
  } catch {
    // File doesn't exist, skip
  }
}
