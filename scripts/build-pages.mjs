import { access, cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "github-pages");
const output = resolve(root, "dist");
const checkOnly = process.argv.includes("--check");
const requiredFiles = [
  "index.html",
  "404.html",
  ".nojekyll",
  "app.js",
  "styles.css",
  "assets/kangmin-avatar.webp",
  "assets/settlements/73.webp",
  "assets/settlements/84.webp",
];

await Promise.all(requiredFiles.map((file) => access(resolve(source, file))));

const indexHtml = await readFile(resolve(source, "index.html"), "utf8");
for (const reference of ["styles.css?v=12", "app.js?v=12"]) {
  if (!indexHtml.includes(reference)) {
    throw new Error(`Missing production asset reference: ${reference}`);
  }
}

if (!checkOnly) {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(source, output, { recursive: true });
  console.log(`Built GitHub Pages site at ${output}`);
} else {
  console.log("GitHub Pages source validation passed");
}
