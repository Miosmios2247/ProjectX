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

// The same page as one complete document (for publishing from files), in the frame
// the artifact host puts around a page body.
const frame =
  '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  "<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}" +
  "html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}" +
  "img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>";
writeFileSync(new URL("lab/dist/index.html", root), `${frame}\n${html}\n</body></html>`);
console.log("lab/dist/index.html       (complete document)");
