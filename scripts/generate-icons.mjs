/**
 * Build the favicon set from the crest in public/images/logo.png,
 * replacing the Create React App defaults (the React atom).
 *
 *   favicon.ico   16 + 32 + 48px (PNG-in-ICO, supported by all modern browsers)
 *   logo192.png   PWA icon
 *   logo512.png   PWA icon
 *
 * Run with:  npm run generate:icons
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'public/images/logo.png';

/** Render the crest centred on a transparent square. */
const square = (size) =>
  sharp(SRC)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

/**
 * Assemble a .ico container from PNG buffers. The ICO format allows PNG
 * payloads directly (no BMP conversion needed) for modern browsers.
 */
const buildIco = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;

  entries.forEach(({ size, buffer }, i) => {
    const base = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, base); // width (0 = 256)
    dir.writeUInt8(size >= 256 ? 0 : size, base + 1); // height
    dir.writeUInt8(0, base + 2); // palette
    dir.writeUInt8(0, base + 3); // reserved
    dir.writeUInt16LE(1, base + 4); // colour planes
    dir.writeUInt16LE(32, base + 6); // bits per pixel
    dir.writeUInt32LE(buffer.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += buffer.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.buffer)]);
};

const run = async () => {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(sizes.map(square));
  const ico = buildIco(sizes.map((size, i) => ({ size, buffer: buffers[i] })));
  await writeFile('public/favicon.ico', ico);
  console.log(`  favicon.ico   ${Math.round(ico.length / 1024)} KB (16/32/48px)`);

  for (const size of [192, 512]) {
    const buffer = await square(size);
    await writeFile(`public/logo${size}.png`, buffer);
    console.log(`  logo${size}.png  ${Math.round(buffer.length / 1024)} KB`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
