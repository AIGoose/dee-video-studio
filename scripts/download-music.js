import { createWriteStream, mkdirSync, existsSync, writeFileSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(__dirname, '..', 'music', 'library');
mkdirSync(LIB, { recursive: true });

const TRACKS = [
  { file: 'corporate-motivation.mp3', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', mood: 'corporate', bpm: 120, tags: ['corporate','testimonial','professional'] },
  { file: 'inspiring-cinematic.mp3',  url: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_a74ea30b0d.mp3', mood: 'cinematic', bpm: 90,  tags: ['cinematic','trailer','emotional'] },
  { file: 'upbeat-community.mp3',     url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_2dde668d05.mp3', mood: 'upbeat',   bpm: 128, tags: ['community','energetic'] },
  { file: 'warm-documentary.mp3',     url: 'https://cdn.pixabay.com/download/audio/2023/01/30/audio_16b3ef0928.mp3', mood: 'warm',     bpm: 75,  tags: ['documentary','story','heartfelt'] },
  { file: 'tech-corporate.mp3',       url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_4d566a5081.mp3', mood: 'tech',     bpm: 110, tags: ['ai','tech','modern'] },
  { file: 'action-sport.mp3',         url: 'https://cdn.pixabay.com/download/audio/2022/06/08/audio_c8a2c5a45d.mp3', mood: 'energetic',bpm: 145, tags: ['viral','energetic','teaser'] },
];

for (const track of TRACKS) {
  const dest = path.join(LIB, track.file);
  writeFileSync(path.join(LIB, track.file.replace(/\.mp3$/, '.json')),
    JSON.stringify({ ...track, license: 'Pixabay License — free commercial use' }, null, 2));
  if (existsSync(dest)) { console.log(`✓ ${track.file} (cached)`); continue; }
  console.log(`⬇ ${track.file}...`);
  try {
    const res = await fetch(track.url);
    if (!res.ok) { console.warn(`  ✗ HTTP ${res.status}`); continue; }
    await pipeline(res.body, createWriteStream(dest));
    console.log(`  ✓ done`);
  } catch(e) { console.warn(`  ✗ ${e.message}`); }
}
console.log('Music library ready.');
