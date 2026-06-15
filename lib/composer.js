import fs from 'fs';
import path from 'path';

function pickMedia(mediaList, preferVideo = true, index = 0) {
  const videos = mediaList.filter(m => m.mime?.startsWith('video/'));
  const images = mediaList.filter(m => m.mime?.startsWith('image/'));
  if (preferVideo && videos.length > index) return videos[index];
  if (images.length > index) return images[index];
  return mediaList[index % Math.max(mediaList.length, 1)] || null;
}

function captionOverlay(text, startSec, durationSec, style = 'default') {
  const styles = {
    default: 'font-size:42px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.8);text-align:center;padding:0 40px;',
    badge: 'font-size:22px;font-weight:600;color:#fff;background:rgba(0,0,0,0.6);padding:8px 20px;border-radius:8px;',
    hook: 'font-size:56px;font-weight:900;color:#fff;text-shadow:0 4px 16px rgba(0,0,0,0.9);line-height:1.1;text-align:center;padding:0 32px;',
    stat: 'font-size:68px;font-weight:900;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,0.85);text-align:center;',
    brand: 'font-size:28px;font-weight:500;color:#fff;letter-spacing:0.04em;text-align:center;',
  };
  return `
  <div class="clip caption-overlay"
       data-start="${startSec}"
       data-duration="${durationSec}"
       data-track-index="10"
       style="position:absolute;bottom:140px;left:0;right:0;display:flex;align-items:flex-end;justify-content:center;pointer-events:none;">
    <span style="${styles[style] || styles.default}">${text}</span>
  </div>`;
}

function clipBlock(srcRel, startSec, durationSec, trackIdx) {
  return `
  <video class="clip" data-start="${startSec}" data-duration="${durationSec}" data-track-index="${trackIdx}"
         src="${srcRel}" muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>`;
}

function imageBlock(srcRel, startSec, durationSec, trackIdx) {
  return `
  <img class="clip" data-start="${startSec}" data-duration="${durationSec}" data-track-index="${trackIdx}"
       src="${srcRel}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`;
}

export async function buildComposition(compDir, projectDir, musicPath, config, workflow, onProgress) {
  const files = config._files || [];
  const { trainerName, tagline, website, clientName, format, duration: totalDur } = config;

  const assetsDir = path.join(compDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const linkedMedia = [];
  for (const f of files) {
    const dest = path.join(assetsDir, path.basename(f.path));
    if (!fs.existsSync(dest)) fs.copyFileSync(f.path, dest);
    linkedMedia.push({ ...f, localPath: dest, rel: `assets/${path.basename(f.path)}` });
  }

  const musicDest = path.join(assetsDir, path.basename(musicPath));
  if (!fs.existsSync(musicDest)) fs.copyFileSync(musicPath, musicDest);
  const musicRel = `assets/${path.basename(musicPath)}`;

  onProgress?.(0.2);
  const cuts = workflow.generateCuts(linkedMedia, config);
  onProgress?.(0.5);

  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];

  let clipBlocks = '';
  let captionBlocks = '';
  let trackIdx = 0;

  for (const cut of cuts) {
    if (cut.mediaFile) {
      if (cut.mediaFile.mime?.startsWith('video/')) clipBlocks += clipBlock(cut.mediaFile.rel, cut.start, cut.duration, trackIdx++);
      else clipBlocks += imageBlock(cut.mediaFile.rel, cut.start, cut.duration, trackIdx++);
    }
    if (cut.caption) captionBlocks += captionOverlay(cut.caption, cut.start + 0.3, cut.duration - 0.5, cut.captionStyle || 'default');
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin:0;padding:0;box-sizing:border-box; }
body { background:#000;overflow:hidden; }
#stage { position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#000; }
.caption-overlay { animation:fadeIn 0.3s ease-in; }
@keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
</style></head><body>
<div id="stage" data-composition-id="dee-video" data-start="0" data-width="${w}" data-height="${h}">
  ${clipBlocks}
  <audio data-start="0" data-duration="${totalDur}" data-track-index="20" data-volume="${config.musicVolume || 0.3}" src="${musicRel}"></audio>
  ${captionBlocks}
  <div class="clip" data-start="0" data-duration="999" data-track-index="11"
       style="position:absolute;bottom:0;left:0;right:0;padding:12px 24px;background:linear-gradient(transparent,rgba(0,0,0,0.65));">
    <span style="font-size:18px;font-weight:700;color:#fff;">${trainerName || 'Dee Ferdinand'}</span>
    <span style="font-size:14px;color:rgba(255,255,255,0.7);margin-left:8px;">· ${tagline || 'AI Corporate Trainer'}</span>
  </div>
  <div class="clip" data-start="${totalDur - 5}" data-duration="5" data-track-index="30"
       style="position:absolute;inset:0;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
    <div style="font-size:44px;font-weight:800;color:#fff;text-align:center;">${trainerName || 'Dee Ferdinand'}</div>
    <div style="font-size:22px;color:rgba(255,255,255,0.8);text-align:center;">${tagline || 'AI Corporate Trainer'}</div>
    <div style="font-size:18px;color:rgba(255,255,255,0.55);margin-top:6px;">${website || 'deeferdinand.com'}</div>
    ${clientName ? `<div style="font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px;">${clientName} · ${new Date().getFullYear()}</div>` : ''}
  </div>
</div></body></html>`;

  fs.writeFileSync(path.join(compDir, 'index.html'), html);
  onProgress?.(1.0);
}
