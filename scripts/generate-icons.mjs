/**
 * Gera todos os ícones da PWA a partir de assets/icon-source.svg.
 * Ícone que retorna 404 quebra a instalação silenciosamente, então cada
 * arquivo referenciado no manifest nasce aqui.
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = await readFile(join(root, "assets", "icon-source.svg"));
const outDir = join(root, "public", "icons");
await mkdir(outDir, { recursive: true });

/** Versão com cantos arredondados, para superfícies que não mascaram. */
async function rounded(size, radiusRatio = 0.22) {
  const r = Math.round(size * radiusRatio);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>
     </svg>`,
  );
  return sharp(src)
    .resize(size, size)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function square(size) {
  return sharp(src).resize(size, size).png().toBuffer();
}

const jobs = [
  ["icon-192.png", await rounded(192)],
  ["icon-512.png", await rounded(512)],
  // Maskable precisa de sangria total: o sistema recorta a zona de segurança.
  ["icon-maskable-192.png", await square(192)],
  ["icon-maskable-512.png", await square(512)],
  // iOS ignora os ícones do manifest e aplica a própria máscara.
  ["apple-touch-icon.png", await square(180)],
];

for (const [name, buf] of jobs) {
  await writeFile(join(outDir, name), buf);
  console.log("→ public/icons/" + name);
}

await writeFile(join(root, "public", "favicon.ico"), await square(48));
console.log("→ public/favicon.ico");
