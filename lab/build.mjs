// Bundles the lab into one HTML file (lab/dist/hoer-labor.html) for publishing.
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

const result = await build({
  entryPoints: [new URL("lab/src/main.ts", root).pathname],
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: true,
  write: false,
  legalComments: "none",
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = read("lab/src/styles.css");
const html = read("lab/index.html")
  .replace("/*__CSS__*/", () => css)
  .replace("//__JS__", () => js);

mkdirSync(new URL("lab/dist/", root), { recursive: true });
writeFileSync(new URL("lab/dist/hoer-labor.html", root), html);
console.log(`lab/dist/hoer-labor.html  ${(html.length / 1024).toFixed(0)} KB`);
