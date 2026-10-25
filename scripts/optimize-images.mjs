import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const root = "public/assets";
const files = [];
(function walk(d){ for (const f of fs.readdirSync(d)) { const p = path.join(d,f); fs.statSync(p).isDirectory() ? walk(p) : /\.(jpe?g)$/i.test(f) && files.push(p); } })(root);
for (const f of files) {
  const before = fs.statSync(f).size;
  const meta = await sharp(f).metadata();
  const buf = await sharp(f).rotate().resize({ width: Math.min(meta.width, 1600), withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toBuffer();
  fs.writeFileSync(f, buf);
  const m2 = await sharp(f).metadata();
  console.log(f, meta.width+"x"+meta.height, "->", m2.width+"x"+m2.height, Math.round(before/1024)+"KB ->", Math.round(buf.length/1024)+"KB");
}
// Recadrage portrait du hero pour mobile (art direction)
const hero = "public/assets/hero.jpg";
const hm = await sharp(hero).metadata();
const cropW = Math.round(hm.height * 0.72);
const left = Math.max(0, Math.min(hm.width - cropW, Math.round(hm.width * 0.30)));
await sharp(hero).extract({ left, top: 0, width: cropW, height: hm.height }).resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile("public/assets/hero-mobile.jpg");
const mm = await sharp("public/assets/hero-mobile.jpg").metadata();
console.log("hero-mobile.jpg", mm.width+"x"+mm.height, Math.round(fs.statSync("public/assets/hero-mobile.jpg").size/1024)+"KB");
