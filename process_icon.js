const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function processIcon() {
  const inputPath = "C:\\Users\\devil\\.gemini\\antigravity\\brain\\cd31a973-e9bf-475e-8b2e-74f981113d46\\media__1773934724625.jpg";
  const outputPath = path.join(__dirname, "assets", "logo.png");
  const publicPath = path.join(__dirname, "public", "logo.png");

  console.log("Loading image:", inputPath);
  const image = await Jimp.read(inputPath);
  
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  // We want to delete the pure white squircle pad.
  // The pad sits in the absolute 4 corners of the box.
  console.log("Image dimensions:", w, "x", h);

  image.scan(0, 0, w, h, function(x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    
    // Pure/mostly white detection
    if (red > 230 && green > 230 && blue > 230) {
      const cx = w / 2;
      const cy = h / 2;
      const dx = Math.abs(x - cx) / cx;
      const dy = Math.abs(y - cy) / cy;
      
      // If the bright pixel is near the far edges/corners, mask it to 0 alpha
      if (dx > 0.4 || dy > 0.4) {
        this.bitmap.data[idx + 3] = 0;
      }
    }
  });

  console.log("Writing logo outputs to assets/ and public/ ...");
  
  if (!fs.existsSync(path.join(__dirname, "assets"))) {
    fs.mkdirSync(path.join(__dirname, "assets"));
  }
  
  await image.writeAsync(outputPath);
  await image.writeAsync(publicPath);
  console.log("Processing and writing complete! Alpha mapped.");
}

processIcon().catch(e => {
  console.error("Failed image mapping:", e);
  process.exit(1);
});
