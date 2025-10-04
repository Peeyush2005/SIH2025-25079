## Broken Conductor Detection – Simple Guide

This small project shows how a relay could detect a Broken Conductor Fault (BCF) on a low‑voltage feeder using OpenDSS.

### What it does (in plain words)
- Reads three‑phase currents from a line in an OpenDSS feeder model.
- Turns those currents into two easy numbers:
  - I1 = “normal” current (positive‑sequence)
  - I2 = “imbalance” current (negative‑sequence)
- Checks the ratio I2/I1. If it is bigger than 0.15 for a short time, it issues a trip.
- Runs twice: first on a healthy system, then after opening Phase A to simulate a broken conductor.

### Big picture (detailed)
- **Digital twin on your PC**: OpenDSS builds an electrical model from `LT_Feeder_Model.dss` (source → transformer → LV line → loads). It assembles the network admittance matrix and solves the steady‑state power‑flow numerically. The result is the same type of phasor voltages/currents a field instrument would measure—so no physical hardware is needed.
- **Where currents come from**: After a solve, the script activates `Line.L1` and reads complex phase currents using `dss.CktElement.Currents()`. The first six values are the real/imag parts of phases A, B, C at terminal 1, which the script groups into three complex phasors.
- **Turning ABC into I1/I2**: The code applies Fortescue’s symmetrical components, using the 120° rotation operator \(a = e^{j120^\circ}\):
  - \(I_1 = \tfrac{1}{3}(I_a + a I_b + a^2 I_c)\)  → the balanced component (positive sequence)
  - \(I_2 = \tfrac{1}{3}(I_a + a^2 I_b + a I_c)\) → the unbalanced component (negative sequence)
  - Magnitudes \(|I_1|\) and \(|I_2|\) are compared; a broken/open phase strongly increases \(|I_2|\) because the three phases are no longer symmetrical.
- **Why a broken conductor raises I2/I1**: Opening one phase forces current in that phase toward zero while the other two keep supplying their loads. This creates a large imbalance, which mathematically appears as a rise in the negative‑sequence current, so the ratio \(R = |I_2|/|I_1|\) jumps.
- **Security and timing (mapped to real relays)**:
  - Minimum load check: require \(|I_1|\) > 8% of rated (prevents operation at no‑load/noise).
  - Threshold: trip only if \(R\) exceeds 0.15 (tunable for sensitivity vs security).
  - Definite time: require the condition to persist for `TRIP_DELAY_SECONDS` (1.0 s here) to ride through transients; in hardware this is the ANSI 46 time delay.
- **Two scenarios**: The script runs once on the healthy system, then issues an OpenDSS command to open Phase A of `Line.L1` (simulated BCF), re‑solves, and re‑evaluates the logic. The second run should exceed the threshold and “TRIP”.

### Files
- `bcf_detecter.py`: Python script that runs the detection logic and prints results.
- `LT_Feeder_Model.dss`: Simple OpenDSS feeder used by the script.

### Requirements
- Windows, Python 3.11 recommended
- Packages: `OpenDSSDirect.py`, `numpy`

### Quick start (PowerShell)
```powershell
cd "C:\Users\Samsung\OneDrive\Desktop\SIH-FINAL-SUBMISSION-2"
python -m pip install --upgrade pip
python -m pip install "OpenDSSDirect.py" numpy
python bcf_detecter.py
```

If you are on Python 3.12 and install fails, create a Python 3.11 virtual env:
```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install "OpenDSSDirect.py" numpy
python bcf_detecter.py
```

### How the code works (super short)
1. Load the DSS model: `clear` → `compile LT_Feeder_Model.dss` → solve.
2. Read line currents of `Line.L1` from OpenDSS (A, B, C as complex numbers).
3. Convert to I1 and I2 using symmetrical components (a standard 3‑phase math transform).
   - Think of I1 as “balanced part” and I2 as “unbalanced part”.
4. Apply protection checks:
   - Ensure I1 is not tiny: I1 must be > 8% of 80 A (min operating load).
   - Compute ratio R = I2/I1.
   - If R > 0.15, wait `TRIP_DELAY_SECONDS` (1.0 s here) and then print TRIP.
5. Simulate a BCF by opening Phase A of `Line.L1`, re‑solve, and repeat step 2–4.

### Expected output (example)
```text
--- Broken Conductor Detection Software Simulation ---
1. Model Compiled: 'LT_Feeder_Model.dss'

--- CASE 1: HEALTHY OPERATION ---
  > I1 Magnitude (Positive Sequence): 140.50 A (Min Req: 6.40 A)
  > I2 Magnitude (Negative Sequence): 1.85 A
  > Calculated Ratio I2/I1: 0.0132 (Threshold: 0.15)
  I2/I1 ratio is normal.
-> Healthy System Status: NORMAL

--- CASE 2: SIMULATE BCF (Phase A Open) ---
2. Fault Simulated: Phase A of Line.L1 is open.
  > I1 Magnitude (Positive Sequence): 95.20 A (Min Req: 6.40 A)
  > I2 Magnitude (Negative Sequence): 47.60 A
  > Calculated Ratio I2/I1: 0.5000 (Threshold: 0.15)
  Broken Conductor condition confirmed by ratio check.
  Waiting for definite time delay of 1.0 seconds...
  *** TRIP COMMAND ISSUED to Breaker/Recloser controlling Line.L1 ***
-> Faulted System Status: TRIPPED
```

### Troubleshooting (quick)
- Install error for `OpenDSSDirect.py` on Python 3.12: use Python 3.11 (see venv above) or `conda-forge`.
- “Unknown Command: CalcVBase”: must be `CalcVoltageBases`.
- Line length syntax: use `Length=0.5 units=km` (not `0.5 km`).
- Duplicate source warning: use `Edit Vsource.Source ...` after `New Circuit...`.
- Run from the folder that contains both `bcf_detecter.py` and `LT_Feeder_Model.dss`.

### Change key settings
- Threshold: change `I2_I1_THRESHOLD` in `bcf_detecter.py`.
- Minimum load: change `RATED_CURRENT_AMPS` or `I1_MIN_THRESHOLD_PU`.
- Time delay: change `TRIP_DELAY_SECONDS`.


