import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function renderVideo(compDir, outputFile, config, onProgress) {
  const { format = '9:16', duration = 75 } = config;
  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  onProgress?.(0);

  // Write meta.json — HyperFrames reads width/height/fps/duration from here
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(
    { duration, width: w, height: h, fps: 30 }, null, 2
  ));

  // Detect Chrome
  const chromePath = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ].find(p => p && fs.existsSync(p));

  console.log(`[renderer] Chrome: ${chromePath || 'auto'} | ${w}x${h} | ${duration}s`);

  // Correct CLI: npx hyperframes render ./index.html -o output.mp4
  const args = ['hyperframes', 'render',
    path.join(compDir, 'index.html'),
    '-o', outputFile,
  ];

  const env = {
    ...process.env,
    PUPPETEER_EXECUTABLE_PATH: chromePath || '/usr/bin/chromium',
    CHROME_PATH: chromePath || '/usr/bin/chromium',
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
      if (code === 0) { onProgress?.(1); resolve(outputFile); }
      else reject(new Error(`HyperFrames render failed:\n${stderr.slice(-800)}`));
    });
  });
}
