import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { renderVideo } from './lib/renderer.js';
import { buildComposition } from './lib/composer.js';
import { getMusicTrack } from './lib/music.js';
import { WORKFLOWS } from './workflows/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const jobs = new Map();
const clients = new Map();

app.use(cors());
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 500 * 1024 * 1024 }, useTempFiles: true, tempFileDir: '/tmp/' }));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/renders', express.static(path.join(__dirname, 'renders')));
app.use('/', express.static(path.join(__dirname, 'static')));

wss.on('connection', (ws, req) => {
  const jobId = new URL(req.url, 'http://x').searchParams.get('job');
  if (jobId) clients.set(jobId, ws);
  ws.on('close', () => { for (const [id, c] of clients) if (c === ws) clients.delete(id); });
});

function push(jobId, data) {
  const ws = clients.get(jobId);
  if (ws?.readyState === 1) ws.send(JSON.stringify(data));
  const job = jobs.get(jobId);
  if (job) Object.assign(job, data);
}

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/api/workflows', (_, res) => res.json(
  Object.entries(WORKFLOWS).map(([id, w]) => ({ id, ...w.meta }))
));

app.get('/api/music', (_, res) => {
  const lib = path.join(__dirname, 'music/library');
  const tracks = fs.existsSync(lib)
    ? fs.readdirSync(lib).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'))
    : [];
  const meta = tracks.map(f => {
    const metaFile = path.join(lib, f.replace(/\.(mp3|wav)$/, '.json'));
    const m = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
    return { file: f, ...m };
  });
  res.json(meta);
});

app.get('/api/jobs', (_, res) =>
  res.json([...jobs.values()].sort((a, b) => b.createdAt - a.createdAt))
);

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

app.post('/api/render', async (req, res) => {
  const jobId = uuid();
  const config = {
    workflow: req.body.workflow || 'testimonial',
    projectName: req.body.projectName || req.body.clientName || 'untitled',
    clientName: req.body.clientName || '',
    trainerName: req.body.trainerName || 'Dee Ferdinand',
    tagline: req.body.tagline || 'AI Corporate Trainer',
    website: req.body.website || 'deeferdinand.com',
    musicTrack: req.body.musicTrack || 'auto',
    musicVolume: parseFloat(req.body.musicVolume || '0.3'),
    format: req.body.format || '9:16',
    duration: parseInt(req.body.duration || '75'),
  };

  const job = { id: jobId, status: 'queued', progress: 0, ...config, createdAt: Date.now(), files: [] };
  jobs.set(jobId, job);

  const projectDir = path.join(__dirname, 'uploads', jobId);
  fs.mkdirSync(projectDir, { recursive: true });

  const uploadedFiles = req.files ? Object.values(req.files).flat() : [];
  for (const f of uploadedFiles) {
    const dest = path.join(projectDir, f.name);
    await f.mv(dest);
    job.files.push({ name: f.name, path: dest, mime: f.mimetype, size: f.size });
  }
  config._files = job.files;

  res.json({ jobId, status: 'queued' });
  setImmediate(() => runJob(jobId, projectDir, config));
});

app.get('/api/download/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job?.outputPath || !fs.existsSync(job.outputPath))
    return res.status(404).json({ error: 'Not ready' });
  res.download(job.outputPath);
});

async function runJob(jobId, projectDir, config) {
  try {
    push(jobId, { status: 'composing', progress: 5 });
    const musicPath = await getMusicTrack(config.musicTrack, config.workflow, config.duration,
      (d) => push(jobId, d));
    push(jobId, { progress: 15 });

    const compDir = path.join(__dirname, 'compositions', 'projects', jobId);
    fs.mkdirSync(compDir, { recursive: true });

    const workflow = WORKFLOWS[config.workflow];
    if (!workflow) throw new Error(`Unknown workflow: ${config.workflow}`);

    await buildComposition(compDir, projectDir, musicPath, config, workflow,
      (p) => push(jobId, { status: 'composing', progress: 15 + Math.round(p * 0.4) }));
    push(jobId, { status: 'rendering', progress: 55 });

    const outDir = path.join(__dirname, 'renders');
    fs.mkdirSync(outDir, { recursive: true });
    const outputFile = path.join(outDir, `${jobId}.mp4`);

    await renderVideo(compDir, outputFile, config,
      (p) => push(jobId, { status: 'rendering', progress: 55 + Math.round(p * 0.4) }));

    push(jobId, { status: 'done', progress: 100, outputPath: outputFile, outputUrl: `/renders/${jobId}.mp4` });
  } catch (err) {
    console.error('[job error]', jobId, err);
    push(jobId, { status: 'error', error: err.message });
  }
}

const PORT = process.env.PORT || 7860;
server.listen(PORT, () => console.log(`✅ Dee Video Studio on port ${PORT}`));
