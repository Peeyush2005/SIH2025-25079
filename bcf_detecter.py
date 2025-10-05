import opendssdirect as dss
import numpy as np
import time
import os
import json
import sys

# --- 1. PROTECTION SETTINGS (Typical ANSI 46BC Parameters) ---
# The monitored device (where the Smart Relay measures current)
MONITORING_DEVICE = 'Line.L1' 
# ANSI 46BC Threshold: Ratio of Negative Sequence (I2) to Positive Sequence (I1)
I2_I1_THRESHOLD = 0.15    # 15% ratio required to confirm BCF
# Minimum I1 current required to operate (prevents trips under light/no-load)
RATED_CURRENT_AMPS = 80.0 # Example rated current for the LV feeder (approx.)
I1_MIN_THRESHOLD_PU = 0.08 # I1 must be > 8% of rated current
# Definite Time Delay: Time the fault must persist before tripping
TRIP_DELAY_SECONDS = 1.0  # Required for security/coordination

# --- 2. CORE MATHEMATICAL FUNCTIONS ---

def calculate_sequence_currents(I_a_complex, I_b_complex, I_c_complex):
    """
    Calculates the Positive (I1) and Negative (I2) sequence current magnitudes 
    using the Symmetrical Component transformation (Fortescue's method).
    """
    # Sequence operator 'a' (1 / 120 degrees)
    a = np.exp(1j * np.deg2rad(120))
    a2 = a * a
    
    # Positive Sequence Current (I1)
    I1 = (1.0/3.0) * (I_a_complex + a * I_b_complex + a2 * I_c_complex)
    
    # Negative Sequence Current (I2)
    I2 = (1.0/3.0) * (I_a_complex + a2 * I_b_complex + a * I_c_complex)

    return abs(I1), abs(I2)

def get_current_measurements(device_name):
    """Retrieves three-phase complex currents from the specified OpenDSS element."""
    try:
        dss.Circuit.SetActiveElement(device_name)
        # OpenDSS returns real/imag pairs for all conductor currents by terminal
        currents = dss.CktElement.Currents()
        
        # Extract A, B, C currents (first 6 values are for Terminal 1)
        # [I_a.real, I_a.imag, I_b.real, I_b.imag, I_c.real, I_c.imag, ...]
        if currents is None or len(currents) < 6:
            raise RuntimeError("CktElement.Currents() returned insufficient data")

        I_a = complex(currents[0], currents[1])
        I_b = complex(currents[2], currents[3])
        I_c = complex(currents[4], currents[5])
        
        return I_a, I_b, I_c
    except Exception as e:
        print(f"Error retrieving currents: {e}")
        return 0, 0, 0

# --- 3. ANSI 46BC DETECTION LOGIC ---

def run_46bc_logic(I_a, I_b, I_c):
    """
    Executes the ANSI 46BC logic for one measurement snapshot.
    """
    I1_mag, I2_mag = calculate_sequence_currents(I_a, I_b, I_c)
    I1_min_amp = RATED_CURRENT_AMPS * I1_MIN_THRESHOLD_PU

    print(f"  > I1 Magnitude (Positive Sequence): {I1_mag:.2f} A (Min Req: {I1_min_amp:.2f} A)")
    print(f"  > I2 Magnitude (Negative Sequence): {I2_mag:.2f} A")
    
    # 1. Security Block Check (I1_min)
    if I1_mag < I1_min_amp:
        print("  I1 is below minimum load threshold. Trip prevented.")
        return False
        
    # 2. Ratio Check
    if I1_mag > 0:
        R_BC = I2_mag / I1_mag
    else:
        R_BC = 0

    print(f"  > Calculated Ratio I2/I1: {R_BC:.4f} (Threshold: {I2_I1_THRESHOLD:.2f})")

    if R_BC > I2_I1_THRESHOLD:
        print("  Broken Conductor condition confirmed by ratio check.")
        
        # 3. Simulate Time Delay (In a real IED, a timer starts here)
        print(f"  Waiting for definite time delay of {TRIP_DELAY_SECONDS} seconds...")
        # In a real IED, the software loop would check the ratio continuously for 1.0s. 
        # For this simulation, we assume the fault persists.
        time.sleep(TRIP_DELAY_SECONDS)
        
        # 4. Issue Trip Command
        print(f"  *** TRIP COMMAND ISSUED to Breaker/Recloser controlling {MONITORING_DEVICE} ***")
        return True
    else:
        print("  I2/I1 ratio is normal.")
        return False

def get_simulation_data():
    """
    Runs the simulation for both healthy and faulted states and returns
    the sequence current data.
    """
    dss_file = 'LT_Feeder_Model.dss'
    if not os.path.exists(dss_file):
        return {"error": f"OpenDSS file '{dss_file}' not found."}

    dss.Text.Command('clear')
    dss.Text.Command(f'compile "{dss_file}"')
    dss.Solution.Solve()

    # Healthy case
    I_a_h, I_b_h, I_c_h = get_current_measurements(MONITORING_DEVICE)
    I1_h, I2_h = calculate_sequence_currents(I_a_h, I_b_h, I_c_h)

    # Fault case
    dss.Text.Command('open line.L1 term=2 phase=1')
    dss.Solution.Solve()
    I_a_f, I_b_f, I_c_f = get_current_measurements(MONITORING_DEVICE)
    I1_f, I2_f = calculate_sequence_currents(I_a_f, I_b_f, I_c_f)
    
    return {
        "healthy": {"I1": I1_h, "I2": I2_h},
        "faulted": {"I1": I1_f, "I2": I2_f}
    }


# --- 4. EXECUTION SIMULATION ---

if __name__ == "__main__":
    
    # Check if a command line argument is passed
    if len(sys.argv) > 1 and sys.argv[1] == '--json':
        data = get_simulation_data()
        print(json.dumps(data))
    else:
        dss_file = 'LT_Feeder_Model.dss'
        
        # Check if the OpenDSS model file exists
        if not os.path.exists(dss_file):
            print(f"Error: OpenDSS file '{dss_file}' not found. Please create it first.")
        else:
            print("-" * 50)
            print("--- Broken Conductor Detection Software Simulation ---")
            
            # Initialize and Compile OpenDSS Model
            dss.Text.Command('clear')
            dss.Text.Command(f'compile "{dss_file}"')
            dss.Solution.Solve()
            print(f"1. Model Compiled: '{dss_file}'")
            
            # --- CASE 1: HEALTHY SYSTEM OPERATION ---
            print("\n--- CASE 1: HEALTHY OPERATION ---")
            I_a_h, I_b_h, I_c_h = get_current_measurements(MONITORING_DEVICE)
            
            is_tripped = run_46bc_logic(I_a_h, I_b_h, I_c_h)
            print(f"-> Healthy System Status: {'TRIPPED' if is_tripped else 'NORMAL'}")
            
            # --- CASE 2: SIMULATE BROKEN CONDUCTOR FAULT (BCF) ---
            print("\n--- CASE 2: SIMULATE BCF (Phase A Open) ---")
            
            # Simulate the BCF by opening the circuit path on Phase A (phase 1) of Line.L1
            # This models the mechanical break of the conductor
            dss.Text.Command('open line.L1 term=2 phase=1') 
            dss.Solution.Solve()
            print(f"2. Fault Simulated: Phase A of {MONITORING_DEVICE} is open.")
            
            # Run the detection logic again on the new faulted measurements
            I_a_f, I_b_f, I_c_f = get_current_measurements(MONITORING_DEVICE)
            
            is_tripped = run_46bc_logic(I_a_f, I_b_f, I_c_f)
            print(f"-> Faulted System Status: {'TRIPPED' if is_tripped else 'NORMAL'}")
            
            print("-" * 50)