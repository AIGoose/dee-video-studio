import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function renderVideo(compDir, outputFile, config, onProgress) {
  const { format = '9:16', duration = 75 } = config;
  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  onProgress?.(0);

  // meta.json — HyperFrames reads width/height/fps/duration from here
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(
    { duration, width: w, height: h, fps: 30 }, null, 2
  ));

  // Find Chrome for Docker
  const chromePath = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ].find(p => p && fs.existsSync(p)) || '/usr/bin/chromium';

  console.log(`[renderer] ${w}x${h} ${duration}s | chrome=${chromePath} | dir=${compDir}`);

  // Correct CLI: npx hyperframes render <dir> -o <output.mp4>
  // dir is the project directory containing index.html
  // -w 1 = 1 worker (cpu-basic has limited RAM, avoid spawning multiple Chromes)
  const args = [
    'hyperframes', 'render',
    compDir,           // positional: project directory
    '-o', outputFile,  // output path
    '-w', '1',         // 1 worker for cpu-basic
    '--fps', '30',
    '--quality', 'standard',
  ];

  const env = {
    ...process.env,
    // HyperFrames uses PRODUCER_HEADLESS_SHELL_PATH for the Chrome path
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
        // HyperFrames may output to renders/ subdir by default
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
