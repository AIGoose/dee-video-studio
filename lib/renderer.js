import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export async function renderVideo(compDir, outputFile, config, onProgress) {
  const { format = '9:16', duration = 75 } = config;
  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  onProgress?.(0);

  const meta = { duration, width: w, height: h, fps: 30 };
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(meta, null, 2));

  return new Promise((resolve, reject) => {
    const proc = execFile('npx', [
      'hyperframes', 'render',
      '--output', outputFile,
      '--width', String(w),
      '--height', String(h),
      '--fps', '30',
    ], { cwd: compDir, maxBuffer: 500 * 1024 * 1024 });

    proc.stdout?.on('data', (d) => {
      const m = d.toString().match(/frame\s+(\d+)\/(\d+)/i);
      if (m) onProgress?.(parseInt(m[1]) / parseInt(m[2]));
    });
    proc.stderr?.on('data', (d) => process.stderr.write(d));
    proc.on('close', (code) => {
      if (code === 0) { onProgress?.(1); resolve(outputFile); }
      else reject(new Error(`HyperFrames exited with code ${code}`));
    });
  });
}
