import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(__dirname, '..', 'music', 'library');

export const MUSIC_LIBRARY = [
  { file: 'corporate-motivation.mp3', mood: 'corporate', bpm: 120, duration: 120, tags: ['corporate', 'testimonial', 'professional', 'uplifting'], url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', license: 'Pixabay License' },
  { file: 'inspiring-cinematic.mp3', mood: 'cinematic', bpm: 90, duration: 150, tags: ['cinematic', 'trailer', 'emotional', 'inspiring'], url: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_a74ea30b0d.mp3', license: 'Pixabay License' },
  { file: 'upbeat-community.mp3', mood: 'upbeat', bpm: 128, duration: 90, tags: ['community', 'public-event', 'energetic', 'positive'], url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_2dde668d05.mp3', license: 'Pixabay License' },
  { file: 'warm-documentary.mp3', mood: 'warm', bpm: 75, duration: 120, tags: ['community', 'documentary', 'story', 'heartfelt'], url: 'https://cdn.pixabay.com/download/audio/2023/01/30/audio_16b3ef0928.mp3', license: 'Pixabay License' },
  { file: 'tech-corporate.mp3', mood: 'tech', bpm: 110, duration: 100, tags: ['ai', 'tech', 'corporate', 'modern', 'training'], url: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_4d566a5081.mp3', license: 'Pixabay License' },
  { file: 'action-sport.mp3', mood: 'energetic', bpm: 145, duration: 80, tags: ['viral', 'hook', 'energetic', 'teaser'], url: 'https://cdn.pixabay.com/download/audio/2022/06/08/audio_c8a2c5a45d.mp3', license: 'Pixabay License' },
];

const MOOD_MAP = {
  testimonial: ['corporate', 'warm'],
  teaser: ['energetic', 'tech'],
  trailer: ['cinematic', 'energetic'],
  community: ['warm', 'upbeat'],
};

export async function getMusicTrack(trackName, workflow, duration, onProgress) {
  fs.mkdirSync(LIB, { recursive: true });
  let track;
  if (trackName === 'auto') {
    const moods = MOOD_MAP[workflow] || ['corporate'];
    track = MUSIC_LIBRARY.find(t => t.tags.some(tag => moods.includes(tag))) || MUSIC_LIBRARY[0];
  } else {
    track = MUSIC_LIBRARY.find(t => t.file === trackName || t.mood === trackName) || MUSIC_LIBRARY[0];
  }
  const destPath = path.join(LIB, track.file);
  if (!fs.existsSync(destPath)) {
    onProgress?.({ status: 'downloading_music', progress: 10 });
    await downloadFile(track.url, destPath);
  }
  return destPath;
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Music download failed: ${res.status}`);
  await pipeline(res.body, createWriteStream(dest));
}

export function listTracks() {
  return MUSIC_LIBRARY.map(({ file, mood, bpm, duration, tags, license }) => ({ file, mood, bpm, duration, tags, license }));
}
