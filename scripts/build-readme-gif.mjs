import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import gifenc from 'gifenc';

const { GIFEncoder, quantize, applyPalette } = gifenc;

const framesDir = path.resolve('docs', 'screenshots', 'frames');
const outGif = path.resolve('docs', 'screenshots', 'navegacao.gif');

const frameFiles = fs
  .readdirSync(framesDir)
  .filter((f) => f.endsWith('.png'))
  .sort();

if (frameFiles.length === 0) {
  throw new Error('Nenhum frame encontrado para gerar GIF.');
}

const encoder = GIFEncoder();

for (const file of frameFiles) {
  const filePath = path.join(framesDir, file);
  const png = PNG.sync.read(fs.readFileSync(filePath));
  const palette = quantize(png.data, 256, { format: 'rgba4444' });
  const index = applyPalette(png.data, palette, 'rgba4444');
  encoder.writeFrame(index, png.width, png.height, {
    palette,
    delay: 900,
    transparent: false
  });
}

encoder.finish();
const output = encoder.bytesView();
fs.writeFileSync(outGif, output);
console.log(`GIF gerado: ${outGif}`);
