const path = require("path");
const sharp = require("sharp");

const sourceDir = "C:/Users/Black/.codex/generated_images/01a1749e-9df1-7df2-b4e3-e39fe3d9d3b3";
const outputDir = path.resolve("public/assets/dishes");

const sets = [
  {
    file: "exec-91252c82-ac03-4149-ba3d-2bfd5a314f91.png", cols: 4, rows: 2,
    names: ["salade-lwalida", "harira", "taktouka", "bakkoula", "zaalouk", "lentilles", "haricots-blancs", "salade-marocaine"],
  },
  {
    file: "exec-5baa0473-b6d4-4308-b600-0a1a8edacf9f.png", cols: 3, rows: 3,
    names: ["tajine-foie-veau", "tajine-pied-veau", "tanjia-lwalida", "tajine-tete-boeuf", "tajine-queue-boeuf", "tripes-boeuf", "tajine-kefta-oeufs", "tajine-poulet-citron", "tajine-kefta-sardines"],
  },
  {
    file: "exec-3be93667-5a4c-47f0-a653-dd6c8530638e.png", cols: 2, rows: 2,
    names: ["seffa", "rfissa", "couscous-boeuf", "couscous-poulet"],
  },
  {
    file: "exec-b5ee927e-b017-4d1c-b407-3c7f2f99d0bc.png", cols: 2, rows: 1,
    names: ["salade-fruits", "mahlabiya"],
  },
  {
    file: "exec-e3d45491-75f5-47d0-869d-fb0b836d4206.png", cols: 4, rows: 2,
    names: ["cafe-espresso", "the-menthe", "coca-classique", "coca-zero", "hawai-tropical", "poms-pomme", "sprite-classique", "sidi-ali"],
  },
];

async function sliceSet(set) {
  const input = path.join(sourceDir, set.file);
  const { width, height } = await sharp(input).metadata();
  const cellWidth = Math.floor(width / set.cols);
  const cellHeight = Math.floor(height / set.rows);
  await Promise.all(set.names.map((name, index) => {
    const col = index % set.cols;
    const row = Math.floor(index / set.cols);
    return sharp(input)
      .extract({ left: col * cellWidth, top: row * cellHeight, width: cellWidth, height: cellHeight })
      .resize(720, 720, { fit: "cover", position: "centre" })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(outputDir, `dish-${name}.webp`));
  }));
}

Promise.all(sets.map(sliceSet)).catch((error) => { console.error(error); process.exitCode = 1; });
