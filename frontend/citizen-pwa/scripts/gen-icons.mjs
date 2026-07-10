/**
 * Generates the PWA icon set (no image dependencies) — solid brand-green field with a
 * centered white ring + dot emblem, all inside the maskable 80% safe zone. Emits regular
 * and maskable PNGs plus an Apple touch icon. Run: `node scripts/gen-icons.mjs`.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

// Brand palette.
const GREEN = [21, 128, 61]; // #15803d
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function pngFromRGBA(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // raw scanlines, each prefixed with filter byte 0
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function draw(size, { padding }) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const safe = size * (1 - padding * 2);
  const rOuter = safe * 0.42;
  const rInner = safe * 0.3;
  const rDot = safe * 0.13;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      let color = GREEN;
      if (d <= rDot) color = WHITE;
      else if (d <= rOuter && d >= rInner) color = WHITE;
      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = 255;
    }
  }
  return pngFromRGBA(size, rgba);
}

const targets = [
  { file: 'icon-192.png', size: 192, padding: 0.08 },
  { file: 'icon-512.png', size: 512, padding: 0.08 },
  { file: 'maskable-192.png', size: 192, padding: 0.18 },
  { file: 'maskable-512.png', size: 512, padding: 0.18 },
  { file: 'apple-touch-icon.png', size: 180, padding: 0.1 },
];

for (const t of targets) {
  writeFileSync(join(OUT, t.file), draw(t.size, { padding: t.padding }));
  process.stdout.write(`wrote icons/${t.file}\n`);
}
