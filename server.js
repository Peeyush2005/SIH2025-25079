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
    ['/usr/local/bin/python3', []], // Docker Python path
    ['/usr/bin/python3', []], // System Python path
    ['python3', []], // PATH Python
    [process.env.PYTHON_PATH || 'python3', []], // Environment variable
    ['py', ['-3']],
    ['py', []],
    ['python', []],
  ];
  
  console.log('Attempting to run Python script with args:', args);
  
  for (const [cmd, prefix] of candidates) {
    console.log(`Trying Python command: ${cmd} ${prefix.join(' ')}`);
    const result = await trySpawn(cmd, [...prefix, scriptPath, ...args]);
    console.log(`Result for ${cmd}:`, { ok: result.ok, hasOutput: !!result.out, error: result.err });
    
    if (result.ok && result.out.trim()) {
      console.log('✅ Python execution successful with:', cmd);
      return result;
    }
  }
  
  console.log('❌ All Python execution attempts failed');
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
  console.log('BCF simulation requested');
  const result = await runPython([]);
  console.log('Python result:', { ok: result.ok, error: result.err, hasOutput: !!result.out });
  
  if (result.ok) {
    return res.json({ output: result.out });
  }
  
  // Provide demo simulation output when Python is not available
  const demoOutput = `--------------------------------------------------
--- Broken Conductor Detection Software Simulation ---
*** DEMO MODE - Python/OpenDSS not available on Azure ***
1. Model: 'LT_Feeder_Model.dss' (simulated)

--- CASE 1: HEALTHY OPERATION ---
  > I1 Magnitude (Positive Sequence): 154.78 A (Min Req: 6.40 A)
  > I2 Magnitude (Negative Sequence): 11.81 A
  > Calculated Ratio I2/I1: 0.0763 (Threshold: 0.15)
  I2/I1 ratio is normal.
-> Healthy System Status: NORMAL

--- CASE 2: SIMULATE BCF (Phase A Open) ---
2. Fault Simulated: Phase A of Line.L1 is open (simulated)
  > I1 Magnitude (Positive Sequence): 102.35 A (Min Req: 6.40 A)
  > I2 Magnitude (Negative Sequence): 53.61 A
  > Calculated Ratio I2/I1: 0.5237 (Threshold: 0.15)
  Broken Conductor condition confirmed by ratio check.
  Waiting for definite time delay of 1.0 seconds...
  *** TRIP COMMAND ISSUED to Breaker/Recloser controlling Line.L1 ***
-> Faulted System Status: TRIPPED

*** Note: This is demo data. Python/OpenDSS error: ${result.err} ***
--------------------------------------------------`;
  
  return res.json({ output: demoOutput });
});

app.listen(PORT, () => {
  console.log(`Web server running on http://127.0.0.1:${PORT}`);
});
