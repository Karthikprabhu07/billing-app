const Jimp = require('jimp');

async function processImage() {
  const filePath = 'C:\\Users\\devil\\.gemini\\antigravity\\brain\\cd31a973-e9bf-475e-8b2e-74f981113d46\\media__1773929781892.jpg';
  try {
    const image = await Jimp.read(filePath);
    let minX = image.bitmap.width, minY = image.bitmap.height, maxX = 0, maxY = 0;
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (r < 240 || g < 240 || b < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    
    image.crop(minX, minY, w, h);
    
    await image.writeAsync('public/logo.jpg');
    await image.writeAsync('assets/icon.jpg');
    console.log('Successfully cropped with Jimp', {minX, minY, w, h});
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processImage();
