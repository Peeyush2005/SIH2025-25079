const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Simple health route
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const scriptPath = path.join(__dirname, 'bcf_detecter.py');

function trySpawn(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('error', () => resolve({ ok: false, out: '', err: 'spawn error' }));
    p.on('close', (code) => resolve({ ok: code === 0, out, err }));
  });
}

async function runPython(args) {
  const candidates = [
    ['py', ['-3']],
    ['py', []],
    ['python', []],
    ['python3', []],
  ];
  for (const [cmd, prefix] of candidates) {
    const result = await trySpawn(cmd, [...prefix, scriptPath, ...args]);
    if (result.ok && result.out.trim()) return result;
  }
  return { ok: false, out: '', err: 'No python found or script failed' };
}

// Proxy to Python for chart data, with safe fallback
app.get('/api/chart-data', async (_req, res) => {
  try {
    const result = await runPython(['--json']);
    if (result.ok) {
      try {
        const data = JSON.parse(result.out);
        return res.json(data);
      } catch (e) {
        // fall through
      }
    }
  } catch (_) {}
  // Fallback static values so site always works
  return res.json({ healthy: { I1: 80, I2: 3 }, faulted: { I1: 60, I2: 15 } });
});

// Run the full simulation and return console output
app.get('/api/run', async (_req, res) => {
  const result = await runPython([]);
  if (result.ok) return res.json({ output: result.out });
  return res.json({ output: 'Python/OpenDSS not available. Showing demo data on the chart. Error: ' + result.err });
});

app.listen(PORT, () => {
  console.log(`Web server running on http://127.0.0.1:${PORT}`);
});
