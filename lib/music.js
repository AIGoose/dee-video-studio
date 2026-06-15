import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(__dirname, '..', 'music', 'library');

// Royalty-free tracks hosted on GitHub/Archive.org — allow server-side download
// All CC0 or CC-BY (free commercial use)
export const MUSIC_LIBRARY = [
  {
    file: 'corporate-motivation.mp3',
    mood: 'corporate', bpm: 120, duration: 120,
    tags: ['corporate', 'testimonial', 'professional', 'uplifting'],
    // CC0 from Free Music Archive / ccMixter
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_07_-_Moonlight_Reprise.mp3',
    license: 'CC0',
  },
  {
    file: 'inspiring-cinematic.mp3',
    mood: 'cinematic', bpm: 90, duration: 150,
    tags: ['cinematic', 'trailer', 'emotional', 'inspiring'],
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_04_-_Interlude.mp3',
    license: 'CC0',
  },
  {
    file: 'upbeat-community.mp3',
    mood: 'upbeat', bpm: 128, duration: 90,
    tags: ['community', 'public-event', 'energetic', 'positive'],
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_01_-_Irsens_Tale.mp3',
    license: 'CC0',
  },
  {
    file: 'warm-documentary.mp3',
    mood: 'warm', bpm: 75, duration: 120,
    tags: ['community', 'documentary', 'story', 'heartfelt'],
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_02_-_Moonlight.mp3',
    license: 'CC0',
  },
  {
    file: 'tech-corporate.mp3',
    mood: 'tech', bpm: 110, duration: 100,
    tags: ['ai', 'tech', 'corporate', 'modern', 'training'],
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_05_-_Old_Lights.mp3',
    license: 'CC0',
  },
  {
    file: 'action-sport.mp3',
    mood: 'energetic', bpm: 145, duration: 80,
    tags: ['viral', 'hook', 'energetic', 'teaser'],
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_03_-_Magic_Forest.mp3',
    license: 'CC0',
  },
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
    const ok = await tryDownload(track.url, destPath);
    if (!ok) {
      // Fallback: generate 90s of silence with ffmpeg
      console.warn(`[music] All downloads failed, generating silence for ${track.file}`);
      await generateSilence(destPath, duration || 90);
    }
  }

  return destPath;
}

async function tryDownload(url, dest) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { console.warn(`[music] Download failed: ${res.status} ${url}`); return false; }
    await pipeline(res.body, createWriteStream(dest));
    const size = fs.statSync(dest).size;
    if (size < 1000) { fs.unlinkSync(dest); return false; }
    console.log(`[music] Downloaded ${path.basename(dest)} (${(size/1024).toFixed(0)}KB)`);
    return true;
  } catch (e) {
    console.warn(`[music] Download error: ${e.message}`);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    return false;
  }
}

async function generateSilence(destPath, durationSecs) {
  try {
    await execFileAsync('ffmpeg', [
      '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`,
      '-t', String(durationSecs),
      '-q:a', '9', '-acodec', 'libmp3lame',
      destPath, '-y'
    ]);
    console.log(`[music] Generated ${durationSecs}s silence at ${destPath}`);
  } catch (e) {
    console.error('[music] ffmpeg silence generation failed:', e.message);
    // Write empty file as last resort
    fs.writeFileSync(destPath, Buffer.alloc(0));
  }
}

export function listTracks() {
  return MUSIC_LIBRARY.map(({ file, mood, bpm, duration, tags, license }) =>
    ({ file, mood, bpm, duration, tags, license }));
}
