/**
 * Compose the 1200x630 social share card (public/images/og-card.jpg) and the
 * responsive WebP variants of the hero photo.
 *
 * WhatsApp and Facebook are this school's main referral channels; both need
 * an absolute og:image or shares render as bare links.
 *
 * Run with:  npm run generate:og
 */
import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e35"/>
      <stop offset="0.55" stop-color="#151d68"/>
      <stop offset="1" stop-color="#0d47a1"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#1a73e8" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#1a73e8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- blueprint grid -->
  <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({ length: 19 }, (_, i) => `<line x1="${(i + 1) * 64}" y1="0" x2="${(i + 1) * 64}" y2="${H}"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${(i + 1) * 64}" x2="${W}" y2="${(i + 1) * 64}"/>`).join('')}
  </g>

  <!-- foundation courses mark -->
  <g transform="translate(96, 208)">
    <rect x="0" y="0" width="42" height="6" rx="3" fill="#8490d6"/>
    <rect x="0" y="12" width="66" height="6" rx="3" fill="#38a9f4"/>
    <rect x="0" y="24" width="27" height="6" rx="3" fill="#ff9800"/>
  </g>

  <text x="96" y="298" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">Azhar Foundation</text>
  <text x="96" y="372" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">School</text>

  <text x="96" y="428" font-family="Arial, sans-serif" font-size="26" font-weight="bold" letter-spacing="6" fill="#7cc8fb">THE FOUNDATION BUILDERS</text>

  <text x="96" y="502" font-family="Arial, sans-serif" font-size="24" fill="#ffffffbb">Playgroup to Matriculation  ·  95% board success  ·  BISE Lahore</text>
  <text x="96" y="540" font-family="Arial, sans-serif" font-size="24" fill="#ffffffbb">Allama Iqbal Town, Lahore  ·  Since 2001</text>

  <!-- gold baseline -->
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="#ff9800"/>
</svg>`;

const run = async () => {
  const crest = await sharp('public/images/logo.png')
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const card = await sharp(Buffer.from(svg))
    .composite([{ input: crest, left: W - 360 - 84, top: Math.round((H - 360) / 2) - 10 }])
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toBuffer();

  await sharp(card).toFile('public/images/og-card.jpg');
  console.log(`  og-card.jpg  ${Math.round(card.length / 1024)} KB`);

  // Hero photo WebP variants for srcset
  for (const width of [1600, 900]) {
    const out = `public/images/banner-${width}.webp`;
    const info = await sharp('public/images/banner.jpg')
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toFile(out);
    console.log(`  banner-${width}.webp  ${Math.round(info.size / 1024)} KB`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
