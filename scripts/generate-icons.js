import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = zlib.crc32(typeAndData);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function generatePNG(size) {
  const width = size;
  const height = size;

  // Header chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw pixels buffer: row = 1 byte filter + w * 4 bytes RGBA
  const rawRowLen = 1 + width * 4;
  const rawBuf = Buffer.alloc(height * rawRowLen);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * 0.44;
  const innerR = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawRowLen;
    rawBuf[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;

      // Default background: Emerald Green (#15803d -> R:21, G:128, B:61)
      let r = 21, g = 128, b = 61, a = 255;

      // Rounded container / subtle gradient effect towards center
      const normDist = Math.sqrt(distSq) / (width / 2);
      if (normDist < 1.0) {
        // Gradient slightly lighter near center (#16a34a -> R:22, G:163, B:74)
        const factor = 1 - normDist * 0.4;
        r = Math.min(255, Math.round(21 * factor + 22 * (1 - factor)));
        g = Math.min(255, Math.round(128 * factor + 163 * (1 - factor)));
        b = Math.min(255, Math.round(61 * factor + 74 * (1 - factor)));
      }

      // Inner decorative ring (White / Light Accent)
      const dist = Math.sqrt(distSq);
      if (dist >= innerR - (width * 0.015) && dist <= innerR) {
        r = 255; g = 255; b = 255; a = 230;
      }

      // Draw Fork & Spoon / Cloche Food Emblem in center
      // 1. Fork (Left side of center: x around cx - size*0.12)
      const forkX = cx - size * 0.11;
      const knifeX = cx + size * 0.11;

      // Vertical stems
      if (Math.abs(x - forkX) <= size * 0.02 && y >= cy - size * 0.05 && y <= cy + size * 0.22) {
        r = 255; g = 255; b = 255; a = 255;
      }
      if (Math.abs(x - knifeX) <= size * 0.02 && y >= cy - size * 0.05 && y <= cy + size * 0.22) {
        r = 255; g = 255; b = 255; a = 255;
      }

      // Fork prongs head
      if (x >= forkX - size * 0.055 && x <= forkX + size * 0.055 && y >= cy - size * 0.22 && y <= cy - size * 0.05) {
        const relY = (y - (cy - size * 0.22)) / (size * 0.17);
        const relX = (x - forkX) / (size * 0.055);
        // Fork base curve
        if (relY >= 0.6 || Math.abs(relX) >= 0.65 || Math.abs(relX) <= 0.2) {
          r = 255; g = 255; b = 255; a = 255;
        }
      }

      // Knife blade head
      if (x >= knifeX - size * 0.02 && x <= knifeX + size * 0.05 && y >= cy - size * 0.22 && y <= cy - size * 0.05) {
        r = 255; g = 255; b = 255; a = 255;
      }

      // Plate / Bowl arc below utensils
      const bowlDist = Math.sqrt(dx * dx + (dy - size * 0.04) * (dy - size * 0.04));
      if (bowlDist >= size * 0.25 && bowlDist <= size * 0.28 && dy > size * 0.02 && dy < size * 0.26) {
        r = 251; g = 191; b = 36; a = 255; // Amber Gold (#fbbf24) accent
      }

      rawBuf[pxOffset] = r;
      rawBuf[pxOffset + 1] = g;
      rawBuf[pxOffset + 2] = b;
      rawBuf[pxOffset + 3] = a;
    }
  }

  const idatCompressed = zlib.deflateSync(rawBuf);
  const idatChunk = createChunk('IDAT', idatCompressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const icon192 = generatePNG(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
console.log('Generated pwa-192x192.png (size:', icon192.length, 'bytes)');

const icon512 = generatePNG(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
console.log('Generated pwa-512x512.png (size:', icon512.length, 'bytes)');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon192);
console.log('Generated apple-touch-icon.png');
