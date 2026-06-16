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

// Working royalty-free tracks — server-accessible (not CDN-blocked)
export const MUSIC_LIBRARY = [
  {
    file: 'corporate-motivation.mp3', mood: 'corporate', bpm: 120,
    tags: ['corporate', 'testimonial', 'professional'],
    // Multiple fallback URLs — tries each until one works
    urls: [
      'https://www.bensound.com/bensound-music/bensound-corporate.mp3',
      'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',
      'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sunshine.mp3',
    ],
    license: 'Bensound free license',
  },
  {
    file: 'inspiring-cinematic.mp3', mood: 'cinematic', bpm: 90,
    tags: ['cinematic', 'trailer', 'emotional'],
    urls: [
      'https://www.bensound.com/bensound-music/bensound-epic.mp3',
      'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3',
    ],
    license: 'Bensound free license',
  },
  {
    file: 'upbeat-community.mp3', mood: 'upbeat', bpm: 128,
    tags: ['community', 'energetic', 'positive'],
    urls: [
      'https://www.bensound.com/bensound-music/bensound-happyrock.mp3',
      'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Digital%20Lemonade.mp3',
    ],
    license: 'Bensound free license',
  },
  {
    file: 'warm-documentary.mp3', mood: 'warm', bpm: 75,
    tags: ['community', 'documentary', 'heartfelt'],
    urls: [
      'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3',
      'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Fluffing%20a%20Duck.mp3',
    ],
    license: 'Bensound free license',
  },
  {
    file: 'tech-corporate.mp3', mood: 'tech', bpm: 110,
    tags: ['ai', 'tech', 'modern', 'training'],
    urls: [
      'https://www.bensound.com/bensound-music/bensound-innovation.mp3',
      'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Local%20Forecast.mp3',
    ],
    license: 'Bensound free license',
  },
  {
    file: 'action-sport.mp3', mood: 'energetic', bpm: 145,
    tags: ['viral', 'energetic', 'teaser'],
    urls: [
      'https://www.bensound.com/bensound-music/bensound-highoctane.mp3',
      'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Scheming%20Weasel.mp3',
    ],
    license: 'Bensound free license',
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
    // Try each URL until one works
    let downloaded = false;
    for (const url of track.urls || []) {
      downloaded = await tryDownload(url, destPath);
      if (downloaded) break;
    }
    if (!downloaded) {
      console.warn(`[music] All URLs failed, generating silence for ${track.file}`);
      await generateSilence(destPath, duration || 90);
    }
  }

  // Verify file has actual audio content
  const size = fs.statSync(destPath).size;
  if (size < 10000) {
    console.warn(`[music] File too small (${size}b), regenerating silence`);
    await generateSilence(destPath, duration || 90);
  }

  return destPath;
}

async function tryDownload(url, dest) {
  try {
    console.log(`[music] Trying: ${url.slice(0, 60)}`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HyperFrames/1.0)',
        'Accept': 'audio/mpeg,audio/*,*/*'
      },
      redirect: 'follow'
    });
    if (!res.ok) { console.warn(`[music] HTTP ${res.status}`); return false; }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) { console.warn('[music] Got HTML, not audio'); return false; }
    await pipeline(res.body, createWriteStream(dest));
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    if (size < 10000) { if (fs.existsSync(dest)) fs.unlinkSync(dest); return false; }
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
    // Generate actual silent MP3 (not empty file — HyperFrames needs valid audio)
    await execFileAsync('ffmpeg', [
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-t', String(durationSecs),
      '-codec:a', 'libmp3lame', '-b:a', '128k',
      destPath, '-y'
    ]);
    console.log(`[music] Generated ${durationSecs}s silence at ${destPath}`);
  } catch (e) {
    console.error('[music] ffmpeg silence gen failed:', e.message);
    fs.writeFileSync(destPath, Buffer.alloc(0));
  }
}

export function listTracks() {
  return MUSIC_LIBRARY.map(({ file, mood, bpm, tags, license }) => ({ file, mood, bpm, tags, license }));
}
