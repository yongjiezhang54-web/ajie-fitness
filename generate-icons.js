// Generate simple PWA icons (green background with white dumbbell emoji area)
const fs = require('fs');
const path = require('path');

// Minimal valid PNG: 1x1 green pixel, we'll use a proper library approach
// For simplicity, let's create SVG icons and convert mentally...
// Actually, let's just create placeholder PNGs using raw binary

function createMinimalPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT chunk - simple uncompressed image data
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(0x05); // R
      rawData.push(0x96); // G  
      rawData.push(0x69); // B
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const iconsDir = path.join(__dirname, 'public', 'icons');

[192, 512].forEach(size => {
  const png = createMinimalPNG(size, size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), png);
  console.log(`Created icon-${size}.png`);
});

// Also create maskable icon (same but with padding)
const maskable = createMinimalPNG(512, 512);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), maskable);
console.log('Created icon-maskable-512.png');
