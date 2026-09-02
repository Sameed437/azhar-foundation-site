/**
 * Downscale and recompress the photographs in public/images.
 *
 * The originals came off a phone at full resolution — several megabytes each,
 * which is far too heavy for a site that shows five of them on one gallery
 * page. Nothing on the site displays an image wider than ~1200 CSS pixels, so
 * anything beyond MAX_WIDTH is wasted bytes.
 *
 * Run with:  npm run optimize:images
 *
 * Originals are tracked in git, so `git checkout -- public/images` restores
 * them if you want to redo this with different settings.
 */
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const DIR = 'public/images';
const MAX_WIDTH = 1600; // generous for a 1200px-wide layout on a 2x screen
const LOGO_MAX_WIDTH = 320; // the logo never renders larger than 56px
const JPEG_QUALITY = 78;

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const run = async () => {
  const files = await readdir(DIR);
  let before = 0;
  let after = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const path = join(DIR, file);
    const original = (await stat(path)).size;
    const isLogo = basename(file, ext).toLowerCase().includes('logo');
    const width = isLogo ? LOGO_MAX_WIDTH : MAX_WIDTH;

    const image = sharp(path).rotate(); // honour EXIF orientation
    const meta = await image.metadata();

    const pipeline = image.resize({
      width: Math.min(width, meta.width ?? width),
      withoutEnlargement: true,
    });

    // Keep PNG for the logo (it has transparency); everything else is a photo.
    const tmp = `${path}.tmp`;
    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9, palette: true }).toFile(tmp);
    } else {
      await pipeline
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toFile(tmp);
    }

    const optimised = (await stat(tmp)).size;

    // Only keep the new file if it is actually smaller.
    if (optimised < original) {
      await rename(tmp, path);
      after += optimised;
      console.log(
        `  ${file.padEnd(14)} ${kb(original).padStart(9)} -> ${kb(optimised).padStart(8)}` +
          `  (-${Math.round((1 - optimised / original) * 100)}%)`
      );
    } else {
      await unlink(tmp);
      after += original;
      console.log(`  ${file.padEnd(14)} ${kb(original).padStart(9)}  already optimal, kept`);
    }

    before += original;
  }

  console.log(
    `\nTotal ${kb(before)} -> ${kb(after)}  ` +
      `(saved ${kb(before - after)}, -${Math.round((1 - after / before) * 100)}%)`
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
