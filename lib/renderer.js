import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export async function renderVideo(compDir, outputFile, config, onProgress) {
  const { format = '9:16', duration = 75 } = config;
  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  onProgress?.(0);

  // Write meta.json
  const meta = { duration, width: w, height: h, fps: 30 };
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(meta, null, 2));

  // Detect Chrome path for Docker
  const chromePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ].filter(Boolean);

  let chromePath = null;
  for (const p of chromePaths) {
    if (fs.existsSync(p)) { chromePath = p; break; }
  }
  console.log(`[renderer] Chrome path: ${chromePath || 'auto-detect'}`);

  // Build hyperframes render args
  const args = ['hyperframes', 'render',
    '--output', outputFile,
    '--width', String(w),
    '--height', String(h),
    '--fps', '30',
  ];
  if (chromePath) args.push('--chrome-path', chromePath);

  return new Promise((resolve, reject) => {
    const proc = execFile('npx', args, {
      cwd: compDir,
      maxBuffer: 500 * 1024 * 1024,
      env: {
        ...process.env,
        PUPPETEER_EXECUTABLE_PATH: chromePath || '/usr/bin/chromium',
        CHROME_PATH: chromePath || '/usr/bin/chromium',
      },
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
      else {
        const errMsg = stderr.slice(-500) || `exit code ${code}`;
        reject(new Error(`HyperFrames render failed:\n${errMsg}`));
      }
    });
  });
}
