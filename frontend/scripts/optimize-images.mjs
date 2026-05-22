import { readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const illustrationDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'illustration');
const iconsDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'icons');

const ILLUSTRATION_MAX_WIDTH = 1280;
const ILLUSTRATION_MOBILE_WIDTH = 800;
const JPEG_QUALITY = 82;
const ICON_MAX_WIDTH = 96;

async function optimizeIllustration(fileName) {
  const baseName = path.parse(fileName).name;
  const inputPath = path.join(illustrationDir, fileName);
  const jpegPath = path.join(illustrationDir, `${baseName}.jpg`);
  const mobilePath = path.join(illustrationDir, `${baseName}-800.jpg`);

  const resize = (width) =>
    sharp(inputPath).rotate().resize(width, null, { withoutEnlargement: true, fit: 'inside' });

  const desktopTmp = `${jpegPath}.tmp`;
  await resize(ILLUSTRATION_MAX_WIDTH)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(desktopTmp);
  await rename(desktopTmp, jpegPath);

  await resize(ILLUSTRATION_MOBILE_WIDTH)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(mobilePath);

  console.log(`Optimized illustration ${fileName}`);
}

async function optimizeIcon(fileName) {
  const inputPath = path.join(iconsDir, fileName);

  const iconTmp = `${inputPath}.tmp`;
  await sharp(inputPath)
    .resize(ICON_MAX_WIDTH, ICON_MAX_WIDTH, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(iconTmp);
  await rename(iconTmp, inputPath);

  console.log(`Optimized icon ${fileName}`);
}

const illustrationFiles = (await readdir(illustrationDir)).filter(
  (name) => /\.(jpe?g|png)$/i.test(name) && !/-800\.(jpe?g|png)$/i.test(name),
);
for (const fileName of illustrationFiles) {
  await optimizeIllustration(fileName);
}

const iconFiles = (await readdir(iconsDir)).filter((name) => name.endsWith('.png'));
for (const fileName of iconFiles) {
  await optimizeIcon(fileName);
}

console.log('Image optimization complete.');
