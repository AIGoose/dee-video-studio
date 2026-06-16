import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Download a remote video URL to a local path (handles redirects)
async function downloadRemoteVideo(url, destPath) {
  const https = await import('https');
  const http = await import('http');
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.default.get : http.default.get;
    get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadRemoteVideo(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const out = createWriteStream(destPath);
      res.pipe(out);
      out.on('finish', () => { out.close(); resolve(destPath); });
      out.on('error', reject);
    }).on('error', reject);
  });
}

// Scan index.html for remote video src="" and download them to assets/
async function prefetchRemoteVideos(compDir) {
  const htmlPath = path.join(compDir, 'index.html');
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf8');

  const srcPattern = /src=["'](https?:\/\/[^"']+\.(?:mov|mp4|webm|MOV|MP4)[^"']*)["']/g;
  const matches = [...html.matchAll(srcPattern)];
  if (!matches.length) return;

  const assetsDir = path.join(compDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  for (const match of matches) {
    const remoteUrl = match[1];
    const filename = 'video-' + Buffer.from(remoteUrl).toString('base64').slice(0,12).replace(/[^a-z0-9]/gi,'') + '.mov';
    const localPath = path.join(assetsDir, filename);
    const relPath = `./assets/${filename}`;

    if (!fs.existsSync(localPath)) {
      console.log(`[renderer] Downloading remote video → ${filename}`);
      await downloadRemoteVideo(remoteUrl, localPath);
      console.log(`[renderer] Downloaded ${(fs.statSync(localPath).size / 1024 / 1024).toFixed(1)} MB`);
    } else {
      console.log(`[renderer] Using cached ${filename}`);
    }

    html = html.split(match[0]).join(match[0].replace(remoteUrl, relPath));
  }

  fs.writeFileSync(htmlPath, html);
  console.log(`[renderer] Patched ${matches.length} remote video src(s) to local paths`);
}

export async function renderVideo(compDir, outputFile, config, onProgress) {
  const { format = '9:16', duration = 75 } = config;
  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  onProgress?.(0);

  // meta.json — HyperFrames reads width/height/fps/duration from here
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(
    { duration, width: w, height: h, fps: 30 }, null, 2
  ));

  // Pre-fetch any remote video URLs in index.html → local assets/
  await prefetchRemoteVideos(compDir);
  onProgress?.(0.1);

  // Find chrome-headless-shell first, fall back to chromium
  const shellGlob = '/app/.chrome/chrome-headless-shell/linux-*/chrome-headless-shell/chrome-headless-shell';
  let headlessShell = '';
  try {
    const { execSync } = await import('child_process');
    headlessShell = execSync(`ls ${shellGlob} 2>/dev/null | head -1`).toString().trim();
  } catch {}

  const chromePath = headlessShell || [
    process.env.PRODUCER_HEADLESS_SHELL_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ].find(p => p && fs.existsSync(p)) || '/usr/bin/chromium';

  console.log(`[renderer] ${w}x${h} ${duration}s | chrome=${chromePath} | dir=${compDir}`);

  const args = [
    'hyperframes', 'render',
    compDir,
    '-o', outputFile,
    '-w', '1',
    '--fps', '30',
    '--quality', 'standard',
  ];

  const env = {
    ...process.env,
    PRODUCER_HEADLESS_SHELL_PATH: chromePath,
    PUPPETEER_EXECUTABLE_PATH: chromePath,
    CHROME_PATH: chromePath,
  };

  return new Promise((resolve, reject) => {
    const proc = execFile('npx', args, {
      cwd: compDir,
      maxBuffer: 500 * 1024 * 1024,
      env,
    });

    let stderr = '';
    proc.stdout?.on('data', (d) => {
      const line = d.toString();
      process.stdout.write(line);
      const m = line.match(/frame\s+(\d+)\/(\d+)/i);
      if (m) onProgress?.(parseInt(m[1]) / parseInt(m[2]));
    });
    proc.stderr?.on('data', (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputFile)) {
        onProgress?.(1);
        resolve(outputFile);
      } else if (code === 0) {
        const defaultOut = path.join(compDir, 'renders', 'index.mp4');
        if (fs.existsSync(defaultOut)) {
          fs.renameSync(defaultOut, outputFile);
          onProgress?.(1);
          resolve(outputFile);
        } else {
          reject(new Error('Render completed but output MP4 not found'));
        }
      } else {
        reject(new Error(`HyperFrames render failed (exit ${code}):\n${stderr.slice(-1000)}`));
      }
    });
  });
}
