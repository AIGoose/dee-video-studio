import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function renderVideo(compDir, outputFile, config, onProgress) {
  const { format = '9:16', duration = 75 } = config;
  const [w, h] = format === '9:16' ? [1080, 1920] : format === '1:1' ? [1080, 1080] : [1920, 1080];
  onProgress?.(0);

  // meta.json tells HyperFrames the canvas size and duration
  fs.writeFileSync(path.join(compDir, 'meta.json'), JSON.stringify(
    { duration, width: w, height: h, fps: 30 }, null, 2
  ));

  const chromePath = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ].find(p => p && fs.existsSync(p));

  console.log(`[renderer] Chrome: ${chromePath} | ${w}x${h} | ${duration}s | cwd: ${compDir}`);

  // Run from INSIDE compDir using relative paths
  // CLI: npx hyperframes render ./index.html -o ./output.mp4
  const localOutput = './render_out.mp4';

  return new Promise((resolve, reject) => {
    const proc = execFile(
      'npx', ['hyperframes', 'render', './index.html', '-o', localOutput],
      {
        cwd: compDir,           // <-- run from inside the project directory
        maxBuffer: 500 * 1024 * 1024,
        env: {
          ...process.env,
          PUPPETEER_EXECUTABLE_PATH: chromePath || '/usr/bin/chromium',
          CHROME_PATH: chromePath || '/usr/bin/chromium',
        },
      }
    );

    let stderr = '';
    proc.stdout?.on('data', (d) => {
      const line = d.toString();
      process.stdout.write(line);
      const m = line.match(/frame\s+(\d+)\/(\d+)/i);
      if (m) onProgress?.(parseInt(m[1]) / parseInt(m[2]));
    });
    proc.stderr?.on('data', (d) => { stderr += d; process.stderr.write(d); });
    proc.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`HyperFrames render failed:\n${stderr.slice(-800)}`));
        return;
      }
      // Move output to final destination
      const rendered = path.join(compDir, 'render_out.mp4');
      if (fs.existsSync(rendered)) {
        fs.renameSync(rendered, outputFile);
        onProgress?.(1);
        resolve(outputFile);
      } else {
        reject(new Error('Render completed but output file not found'));
      }
    });
  });
}
