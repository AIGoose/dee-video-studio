import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Upload a rendered MP4 to HuggingFace Dataset repo.
 * Returns { hf_url, viewer_url, repo_id, filename } on success.
 */
export async function uploadToHuggingFace(localPath, filename) {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error('HF_TOKEN env var not set — cannot upload to HuggingFace');

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'uploader.py');
    const python = process.env.PYTHON_PATH || '/app/venv/bin/python3';

    execFile(python, [scriptPath, localPath, filename, token], { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) { reject(new Error(stderr || err.message)); return; }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) { reject(new Error(result.error)); return; }
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse uploader output: ${stdout}`));
      }
    });
  });
}
