import fs from 'fs';
import path from 'path';

function pick(media, preferVideo, idx) {
  const v = media.filter(m => m.mime?.startsWith('video/'));
  const i = media.filter(m => m.mime?.startsWith('image/'));
  const pool = preferVideo ? (v.length ? v : i) : (i.length ? i : v);
  return pool[idx % Math.max(pool.length, 1)] || media[idx % Math.max(media.length, 1)] || null;
}

export async function buildComposition(compDir, projectDir, musicPath, config, workflow, onProgress) {
  const files = config._files || [];
  const { trainerName = 'Dee Ferdinand', tagline = 'AI Corporate Trainer',
    website = 'deeferdinand.com', clientName = '', format = '9:16', duration: totalDur = 30 } = config;

  const assetsDir = path.join(compDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  // Copy uploaded files into assets/
  const linkedMedia = [];
  for (const f of files) {
    const dest = path.join(assetsDir, path.basename(f.path));
    if (!fs.existsSync(dest)) fs.copyFileSync(f.path, dest);
    linkedMedia.push({ ...f, rel: `./assets/${path.basename(f.path)}` });
  }

  // Copy music
  const musicDest = path.join(assetsDir, 'music.mp3');
  if (!fs.existsSync(musicDest)) fs.copyFileSync(musicPath, musicDest);

  onProgress?.(0.2);

  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  const compId = `dee-${config.workflow}-${Date.now()}`;

  // Write meta.json (HyperFrames reads this)
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(
    { name: compId, id: compId, duration: totalDur, width: w, height: h, fps: 30 }, null, 2
  ));

  const html = workflow.buildHTML(linkedMedia, config, compId, w, h, totalDur);
  fs.writeFileSync(path.join(compDir, 'index.html'), html);
  onProgress?.(1.0);
}
