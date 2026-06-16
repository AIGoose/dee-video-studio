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

/**
 * Music generation waterfall:
 * 1. ElevenLabs client.music.compose() — highest quality lo-fi upbeat
 * 2. YuE via HF Inference API — open source fallback
 * 3. ffmpeg silence — always available last resort
 */

// ElevenLabs prompts by workflow (instrumental, lofi-upbeat style)
const EL_PROMPTS = {
  testimonial: 'Lo-fi upbeat instrumental, warm jazzy piano chords, soft vinyl crackle, positive motivational energy, subtle hip-hop drums, 88 BPM, no lyrics, royalty-free background music for AI corporate training video',
  teaser:      'Energetic upbeat electronic beat, punchy kick drum, rising synth arpeggios, building tension, 118 BPM, no lyrics, for event teaser video',
  trailer:     'Cinematic orchestral build, emotional string swells, powerful percussion, rising tension to climax, 95 BPM, no lyrics, for brand trailer video',
  community:   'Warm acoustic guitar melody, gentle piano accompaniment, uplifting heartfelt positive, 75 BPM, no lyrics, for community training story video',
};

// YuE prompts (open-source music gen)
const YUE_PROMPTS = {
  testimonial: '[Genre: Lo-fi Hip Hop] [Mood: Upbeat, Positive, Warm] [Instruments: Jazz Piano, Soft Drums, Bass Guitar] Instrumental background music 88 BPM no lyrics',
  teaser:      '[Genre: Electronic] [Mood: Energetic, Rising, Exciting] [Instruments: Synth, Kick Drum, Bass] Instrumental teaser 118 BPM no lyrics',
  trailer:     '[Genre: Cinematic Orchestral] [Mood: Epic, Emotional, Building] [Instruments: Strings, Percussion, Brass] Instrumental trailer 95 BPM no lyrics',
  community:   '[Genre: Acoustic Folk] [Mood: Warm, Uplifting, Heartfelt] [Instruments: Acoustic Guitar, Piano] Instrumental 75 BPM no lyrics',
};

export async function getMusicTrack(trackName, workflow, duration, onProgress) {
  fs.mkdirSync(LIB, { recursive: true });

  const wf = workflow || 'testimonial';
  const cacheFile = path.join(LIB, `${wf}-${duration}s.mp3`);
  const dur = duration || 30;
  const genDur = dur + 6; // always generate 6s extra for safety

  // Return cached if valid
  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 50000) {
    console.log(`[music] Using cached: ${path.basename(cacheFile)}`);
    return cacheFile;
  }

  onProgress?.({ status: 'generating_music', progress: 8 });

  // 1. Try ElevenLabs
  const elKey = process.env.ELEVENLABS_API_KEY;
  if (elKey) {
    try {
      console.log('[music] Generating with ElevenLabs music_v2...');
      const ok = await generateElevenLabsMusic(elKey, wf, genDur, cacheFile);
      if (ok) {
        console.log(`[music] ElevenLabs generated: ${(fs.statSync(cacheFile).size/1024).toFixed(0)}KB`);
        return cacheFile;
      }
    } catch (e) {
      console.warn('[music] ElevenLabs failed:', e.message);
    }
  } else {
    console.log('[music] No ELEVENLABS_API_KEY, skipping ElevenLabs');
  }

  // 2. Try YuE via HF Inference
  const hfToken = process.env.HF_TOKEN;
  try {
    console.log('[music] Trying YuE via HF Inference...');
    const ok = await generateYueMusic(hfToken, wf, genDur, cacheFile);
    if (ok) {
      console.log(`[music] YuE generated: ${(fs.statSync(cacheFile).size/1024).toFixed(0)}KB`);
      return cacheFile;
    }
  } catch (e) {
    console.warn('[music] YuE failed:', e.message);
  }

  // 3. Try bensound URLs
  const bensoundUrls = [
    'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',
    'https://www.bensound.com/bensound-music/bensound-happyrock.mp3',
    'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3',
  ];
  for (const url of bensoundUrls) {
    try {
      const ok = await tryDownload(url, cacheFile);
      if (ok) { console.log('[music] Bensound downloaded'); return cacheFile; }
    } catch (e) { /* continue */ }
  }

  // 4. ffmpeg silence (always works)
  console.warn('[music] All sources failed, generating silence');
  await generateSilence(cacheFile, genDur);
  return cacheFile;
}

async function generateElevenLabsMusic(apiKey, workflow, durationSecs, destPath) {
  const prompt = EL_PROMPTS[workflow] || EL_PROMPTS.testimonial;
  const musicLengthMs = durationSecs * 1000;

  const res = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      music_length_ms: musicLengthMs,
      model_id: 'music_v2',
      force_instrumental: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API ${res.status}: ${err.slice(0, 200)}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    const body = await res.text();
    throw new Error(`ElevenLabs returned non-audio: ${body.slice(0, 200)}`);
  }

  await pipeline(res.body, createWriteStream(destPath));
  const size = fs.existsSync(destPath) ? fs.statSync(destPath).size : 0;
  if (size < 10000) {
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    return false;
  }
  return true;
}

async function generateYueMusic(hfToken, workflow, durationSecs, destPath) {
  const prompt = YUE_PROMPTS[workflow] || YUE_PROMPTS.testimonial;
  const headers = {
    'Content-Type': 'application/json',
    ...(hfToken ? { 'Authorization': `Bearer ${hfToken}` } : {}),
  };

  // YuE model variants on HF Hub
  const yueEndpoints = [
    'https://api-inference.huggingface.co/models/m-a-p/YuE-s1-7B-anneal-en-cot',
    'https://api-inference.huggingface.co/models/m-a-p/YuE-s2-1B-general',
  ];

  for (const url of yueEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inputs: prompt, parameters: { max_length: durationSecs * 50 } }),
        signal: AbortSignal.timeout(120000), // 2min timeout
      });
      if (!res.ok) continue;
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('audio')) continue;
      await pipeline(res.body, createWriteStream(destPath));
      const size = fs.existsSync(destPath) ? fs.statSync(destPath).size : 0;
      if (size > 10000) return true;
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    } catch (e) { /* try next */ }
  }
  return false;
}

async function tryDownload(url, dest) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'audio/mpeg,audio/*,*/*' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('text/html')) return false;
    await pipeline(res.body, createWriteStream(dest));
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    if (size < 10000) { if (fs.existsSync(dest)) fs.unlinkSync(dest); return false; }
    return true;
  } catch (e) { if (fs.existsSync(dest)) fs.unlinkSync(dest); return false; }
}

async function generateSilence(destPath, durationSecs) {
  try {
    await execFileAsync('ffmpeg', [
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-t', String(durationSecs),
      '-codec:a', 'libmp3lame', '-b:a', '128k',
      destPath, '-y'
    ]);
    console.log(`[music] Generated ${durationSecs}s silence`);
  } catch (e) {
    console.error('[music] ffmpeg silence gen failed:', e.message);
    fs.writeFileSync(destPath, Buffer.alloc(0));
  }
}

export function listTracks() {
  return [{ file: 'auto', mood: 'auto', bpm: 88, tags: ['lo-fi', 'upbeat', 'instrumental'], license: 'ElevenLabs generated' }];
}
