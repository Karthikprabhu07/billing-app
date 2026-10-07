const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function generatePwaIcons() {
  const inputPath = path.join(__dirname, "assets", "icon.png");
  const iconsDir = path.join(__dirname, "public", "icons");
  
  if (!fs.existsSync(iconsDir)){
      fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log("Loading image:", inputPath);
  const image = await Jimp.read(inputPath);
  
  const sizes = [48, 72, 96, 128, 192, 256, 512];
  
  for (const size of sizes) {
      const resized = image.clone().resize(size, size);
      const outPath = path.join(iconsDir, `icon-${size}.png`);
      await resized.writeAsync(outPath);
      console.log(`Generated ${outPath}`);
  }
}

generatePwaIcons().catch(e => {
  console.error(e);
  process.exit(1);
});
