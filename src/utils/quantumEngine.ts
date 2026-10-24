import {
  Complex,
  GatePlacement,
  QPUProfile,
  SimulationResult,
  StatevectorEntry,
  ReducedDensityMatrix,
  AncillaCorruptionAnalysis,
  TranspiledCircuitReport,
} from '../types/quantum';

// Complex Number Operations
export const complex = {
  create: (re = 0, im = 0): Complex => ({ re, im }),
  add: (a: Complex, b: Complex): Complex => {
    const aRe = a?.re ?? 0;
    const aIm = a?.im ?? 0;
    const bRe = b?.re ?? 0;
    const bIm = b?.im ?? 0;
    return { re: aRe + bRe, im: aIm + bIm };
  },
  sub: (a: Complex, b: Complex): Complex => {
    const aRe = a?.re ?? 0;
    const aIm = a?.im ?? 0;
    const bRe = b?.re ?? 0;
    const bIm = b?.im ?? 0;
    return { re: aRe - bRe, im: aIm - bIm };
  },
  mul: (a: Complex, b: Complex): Complex => {
    const aRe = a?.re ?? 0;
    const aIm = a?.im ?? 0;
    const bRe = b?.re ?? 0;
    const bIm = b?.im ?? 0;
    return {
      re: aRe * bRe - aIm * bIm,
      im: aRe * bIm + aIm * bRe,
    };
  },
  scale: (a: Complex, s: number): Complex => ({
    re: (a?.re ?? 0) * s,
    im: (a?.im ?? 0) * s,
  }),
  absSq: (a: Complex): number => {
    const r = a?.re ?? 0;
    const i = a?.im ?? 0;
    return r * r + i * i;
  },
  norm: (a: Complex): number => {
    const r = a?.re ?? 0;
    const i = a?.im ?? 0;
    return Math.sqrt(r * r + i * i);
  },
  phase: (a: Complex): number => Math.atan2(a?.im ?? 0, a?.re ?? 0),
  conjugate: (a: Complex): Complex => ({ re: a?.re ?? 0, im: -(a?.im ?? 0) }),
  format: (a: Complex): string => {
    const aRe = a?.re ?? 0;
    const aIm = a?.im ?? 0;
    const r = Math.abs(aRe) < 1e-5 ? 0 : Number(aRe.toFixed(4));
    const i = Math.abs(aIm) < 1e-5 ? 0 : Number(aIm.toFixed(4));
    if (i === 0) return `${r}`;
    if (r === 0) return i === 1 ? 'i' : i === -1 ? '-i' : `${i}i`;
    return `${r} ${i > 0 ? '+' : '-'} ${Math.abs(i) === 1 ? '' : Math.abs(i)}i`;
  },
};

// 2x2 Matrix Definition
export type Matrix2x2 = [[Complex, Complex], [Complex, Complex]];
export type Matrix4x4 = Complex[][];

const INV_SQRT2 = 1 / Math.SQRT2;

export function getGateMatrix(gateType: string, angle = 0): Matrix2x2 {
  switch (gateType.toUpperCase()) {
    case 'H':
      return [
        [complex.create(INV_SQRT2, 0), complex.create(INV_SQRT2, 0)],
        [complex.create(INV_SQRT2, 0), complex.create(-INV_SQRT2, 0)],
      ];
    case 'X':
      return [
        [complex.create(0, 0), complex.create(1, 0)],
        [complex.create(1, 0), complex.create(0, 0)],
      ];
    case 'Y':
      return [
        [complex.create(0, 0), complex.create(0, -1)],
        [complex.create(0, 1), complex.create(0, 0)],
      ];
    case 'Z':
      return [
        [complex.create(1, 0), complex.create(0, 0)],
        [complex.create(0, 0), complex.create(-1, 0)],
      ];
    case 'S':
      return [
        [complex.create(1, 0), complex.create(0, 0)],
        [complex.create(0, 0), complex.create(0, 1)],
      ];
    case 'T': {
      const cosPi4 = Math.cos(Math.PI / 4);
      const sinPi4 = Math.sin(Math.PI / 4);
      return [
        [complex.create(1, 0), complex.create(0, 0)],
        [complex.create(0, 0), complex.create(cosPi4, sinPi4)],
      ];
    }
    case 'RX': {
      const c = Math.cos(angle / 2);
      const s = Math.sin(angle / 2);
      return [
        [complex.create(c, 0), complex.create(0, -s)],
        [complex.create(0, -s), complex.create(c, 0)],
      ];
    }
    case 'RY': {
      const c = Math.cos(angle / 2);
      const s = Math.sin(angle / 2);
      return [
        [complex.create(c, 0), complex.create(-s, 0)],
        [complex.create(s, 0), complex.create(c, 0)],
      ];
    }
    case 'RZ': {
      const c = Math.cos(angle / 2);
      const s = Math.sin(angle / 2);
      return [
        [complex.create(c, -s), complex.create(0, 0)],
        [complex.create(0, 0), complex.create(c, s)],
      ];
    }
    default:
      // Identity
      return [
        [complex.create(1, 0), complex.create(0, 0)],
        [complex.create(0, 0), complex.create(1, 0)],
      ];
  }
}

// 4x4 CNOT matrix in standard 2-qubit basis |00>, |01>, |10>, |11>
export function getCNOTMatrix(control: number, target: number): Matrix4x4 {
  // If control=0, target=1 (Qiskit little-endian: |q1 q0>):
  // |00> -> |00>, |01> -> |11>, |10> -> |10>, |11> -> |01>
  const mat: Matrix4x4 = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => complex.create(0, 0))
  );

  for (let i = 0; i < 4; i++) {
    const q0 = i & 1;
    const q1 = (i >> 1) & 1;
    let nextQ0 = q0;
    let nextQ1 = q1;

    if (control === 0 && target === 1) {
      if (q0 === 1) nextQ1 = 1 - q1;
    } else {
      if (q1 === 1) nextQ0 = 1 - q0;
    }
    const outIdx = (nextQ1 << 1) | nextQ0;
    mat[outIdx][i] = complex.create(1, 0);
  }
  return mat;
}

// Check unitary property: U^dagger * U = I
export function isUnitary(mat: Complex[][]): boolean {
  const n = mat.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let sum = complex.create(0, 0);
      for (let k = 0; k < n; k++) {
        // (U^dagger)[r][k] = conj(U[k][r])
        const uDagger_rk = complex.conjugate(mat[k][r]);
        const u_kc = mat[k][c];
        sum = complex.add(sum, complex.mul(uDagger_rk, u_kc));
      }
      const targetRe = r === c ? 1 : 0;
      if (Math.abs(sum.re - targetRe) > 1e-4 || Math.abs(sum.im) > 1e-4) {
        return false;
      }
    }
  }
  return true;
}

// Simulate statevector across gates
// Qiskit little-endian: index bit 0 is q0, bit n-1 is q_{n-1}
export function simulateStatevector(
  qubitCount: number,
  gates: GatePlacement[],
  upToStep: number = 9999
): StatevectorEntry[] {
  const safeQubitCount = Math.max(1, Math.min(6, qubitCount || 1));
  const dim = 1 << safeQubitCount;
  // Initialize to |0...0>
  let state: Complex[] = Array.from({ length: dim }, (_, i) =>
    i === 0 ? complex.create(1, 0) : complex.create(0, 0)
  );

  // Filter out gates on out-of-range wires and sort
  const activeGates = gates
    .filter(g => {
      if (g.step > upToStep) return false;
      if (g.qubit >= safeQubitCount) return false;
      if (g.target !== undefined && g.target >= safeQubitCount) return false;
      if (g.control !== undefined && g.control >= safeQubitCount) return false;
      if (g.control2 !== undefined && g.control2 >= safeQubitCount) return false;
      return true;
    })
    .sort((a, b) => a.step - b.step || a.qubit - b.qubit);

  for (const g of activeGates) {
    state = applyGateToState(safeQubitCount, state, g);
  }

  // Convert to StatevectorEntry array with little-endian bitstrings
  const results: StatevectorEntry[] = [];
  for (let i = 0; i < dim; i++) {
    let bitstring = '';
    for (let q = safeQubitCount - 1; q >= 0; q--) {
      bitstring += (i >> q) & 1 ? '1' : '0';
    }
    const amp = state[i] || complex.create(0, 0);
    const prob = complex.absSq(amp);
    results.push({
      bitstring,
      amplitude: amp,
      probability: Math.abs(prob) < 1e-6 ? 0 : prob,
      phase: complex.phase(amp),
    });
  }

  return results;
}

// Single step state transition
function applyGateToState(qubitCount: number, state: Complex[], gate: GatePlacement): Complex[] {
  if (gate.qubit >= qubitCount) return state;
  const dim = 1 << qubitCount;
  const nextState: Complex[] = Array.from({ length: dim }, () => complex.create(0, 0));

  const { type, qubit, target, control, control2, angle = 0 } = gate;

  if (type === 'M') {
    // Measurement does not change pure state representation in coherent preview
    return state;
  }

  if (type === 'CX' || type === 'CZ' || type === 'SWAP') {
    const ctrl = control !== undefined ? control : qubit;
    const tgt = target !== undefined ? target : (qubit + 1) % qubitCount;
    if (ctrl >= qubitCount || tgt >= qubitCount || ctrl === tgt) {
      return state;
    }

    for (let i = 0; i < dim; i++) {
      const ctrlBit = (i >> ctrl) & 1;
      const tgtBit = (i >> tgt) & 1;
      const curAmp = state[i] || complex.create(0, 0);

      if (type === 'CX') {
        if (ctrlBit === 1) {
          const flipped = i ^ (1 << tgt);
          if (flipped < dim) {
            nextState[flipped] = complex.add(nextState[flipped] || complex.create(0, 0), curAmp);
          }
        } else {
          nextState[i] = complex.add(nextState[i] || complex.create(0, 0), curAmp);
        }
      } else if (type === 'CZ') {
        if (ctrlBit === 1 && tgtBit === 1) {
          nextState[i] = complex.add(nextState[i] || complex.create(0, 0), complex.scale(curAmp, -1));
        } else {
          nextState[i] = complex.add(nextState[i] || complex.create(0, 0), curAmp);
        }
      } else if (type === 'SWAP') {
        if (ctrlBit !== tgtBit) {
          const swapped = i ^ (1 << ctrl) ^ (1 << tgt);
          if (swapped < dim) {
            nextState[swapped] = complex.add(nextState[swapped] || complex.create(0, 0), curAmp);
          }
        } else {
          nextState[i] = complex.add(nextState[i] || complex.create(0, 0), curAmp);
        }
      }
    }
    return nextState;
  }

  if (type === 'CCX') {
    // Toffoli: control, control2, target
    const c1 = control !== undefined ? control : qubit;
    const c2 = control2 !== undefined ? control2 : (qubit + 1) % qubitCount;
    const tgt = target !== undefined ? target : (qubit + 2) % qubitCount;
    if (c1 >= qubitCount || c2 >= qubitCount || tgt >= qubitCount || c1 === tgt || c2 === tgt) {
      return state;
    }

    for (let i = 0; i < dim; i++) {
      const c1Bit = (i >> c1) & 1;
      const c2Bit = (i >> c2) & 1;
      const curAmp = state[i] || complex.create(0, 0);

      if (c1Bit === 1 && c2Bit === 1) {
        const flipped = i ^ (1 << tgt);
        if (flipped < dim) {
          nextState[flipped] = complex.add(nextState[flipped] || complex.create(0, 0), curAmp);
        }
      } else {
        nextState[i] = complex.add(nextState[i] || complex.create(0, 0), curAmp);
      }
    }
    return nextState;
  }

  // Single qubit gates
  const u = getGateMatrix(type, angle);
  const qBit = qubit;

  for (let i = 0; i < dim; i++) {
    const bit = (i >> qBit) & 1;
    const partner = i ^ (1 << qBit);

    // Compute transformation
    if (bit === 0 && partner < dim) {
      const amp0 = state[i] || complex.create(0, 0);
      const amp1 = state[partner] || complex.create(0, 0);

      const newAmp0 = complex.add(complex.mul(u[0][0], amp0), complex.mul(u[0][1], amp1));
      const newAmp1 = complex.add(complex.mul(u[1][0], amp0), complex.mul(u[1][1], amp1));

      nextState[i] = complex.add(nextState[i] || complex.create(0, 0), newAmp0);
      nextState[partner] = complex.add(nextState[partner] || complex.create(0, 0), newAmp1);
    }
  }

  return nextState;
}

// Generate human-readable Dirac notation from statevector
export function formatDiracNotation(entries: StatevectorEntry[]): string {
  const nonZero = entries.filter(e => e.probability > 0.0001);
  if (nonZero.length === 0) return '|0...0⟩';

  // Check common symmetric superposition forms
  const allEqualProb = nonZero.every(e => Math.abs(e.probability - nonZero[0].probability) < 0.005);
  const n = nonZero.length;

  if (allEqualProb && n === 2) {
    const [a, b] = nonZero;
    const isMinus = Math.abs(a.phase - b.phase) > 1.5 && Math.abs(Math.abs(a.phase - b.phase) - Math.PI) < 0.3;
    const sign = isMinus ? ' - ' : ' + ';
    return `1/√2 (|${a.bitstring}⟩${sign}|${b.bitstring}⟩)`;
  }

  if (allEqualProb && (n === 4 || n === 8)) {
    return `1/√${n} (` + nonZero.map(e => `|${e.bitstring}⟩`).join(' + ') + `)`;
  }

  // General Dirac expansion
  const parts: string[] = [];
  nonZero.forEach((e, idx) => {
    const ampStr = complex.format(e.amplitude);
    const prefix = idx > 0 && !ampStr.startsWith('-') ? '+ ' : '';
    parts.push(`${prefix}(${ampStr})|${e.bitstring}⟩`);
  });

  return parts.join(' ');
}

// Preset QPU Profiles
export const QPU_PROFILES: Record<string, QPUProfile> = {
  ideal: {
    id: 'ideal_aer',
    name: 'Ideal AerSimulator (Statevector)',
    qubitCount: 32,
    qubitTech: 'Universal Ideal Simulator',
    singleQubitError: 0,
    twoQubitError: 0,
    readoutError: 0,
    t1_us: 999999,
    t2_us: 999999,
    clops: 25000,
    queueLength: 0,
    status: 'Online',
  },
  ibm_fez: {
    id: 'ibm_fez',
    name: 'ibm_fez (Heron r2 - 156 Qubits)',
    qubitCount: 156,
    qubitTech: 'Superconducting Transmon (Heavy-Hex)',
    singleQubitError: 0.00024,
    twoQubitError: 0.0078,
    readoutError: 0.012,
    t1_us: 285.4,
    t2_us: 210.8,
    clops: 8200,
    queueLength: 14,
    status: 'Online',
  },
  ibm_pittsburgh: {
    id: 'ibm_pittsburgh',
    name: 'ibm_pittsburgh (Nighthawk - 133 Qubits)',
    qubitCount: 133,
    qubitTech: 'Superconducting Transmon (Next-Gen Tunable)',
    singleQubitError: 0.00018,
    twoQubitError: 0.0052,
    readoutError: 0.009,
    t1_us: 340.2,
    t2_us: 280.1,
    clops: 11400,
    queueLength: 26,
    status: 'Online',
  },
};

// Realistic Shot Sampler with multinomial sampling and QPU noise simulation
export function runSimulation(
  qubitCount: number,
  gates: GatePlacement[],
  shots: number,
  qpuId: string = 'ideal'
): SimulationResult {
  const profile = QPU_PROFILES[qpuId] || QPU_PROFILES.ideal;
  const isNoisy = qpuId !== 'ideal';

  const stateEntries = simulateStatevector(qubitCount, gates);
  const idealCounts: Record<string, number> = {};
  const counts: Record<string, number> = {};
  const probabilities: Record<string, number> = {};

  // Build ideal probability map
  stateEntries.forEach(entry => {
    probabilities[entry.bitstring] = entry.probability;
    idealCounts[entry.bitstring] = Math.round(entry.probability * shots);
    counts[entry.bitstring] = 0;
  });

  // Calculate circuit gate counts for noise compounding
  let cnotCount = 0;
  let singleGateCount = 0;
  gates.forEach(g => {
    if (g.type === 'CX' || g.type === 'CZ' || g.type === 'SWAP' || g.type === 'CCX') {
      cnotCount += g.type === 'CCX' ? 6 : 1;
    } else if (g.type !== 'M') {
      singleGateCount++;
    }
  });

  // Compute accumulated error probability if noisy
  let noiseLeakRate = 0;
  if (isNoisy) {
    const gateInfidelity = singleGateCount * profile.singleQubitError + cnotCount * profile.twoQubitError;
    const readoutLeak = qubitCount * profile.readoutError;
    const decoherenceLeak = 0.025; // standard thermal relaxation
    noiseLeakRate = Math.min(0.25, gateInfidelity + readoutLeak + decoherenceLeak);
  }

  // Sample shots
  const bitstrings = Object.keys(probabilities);
  const cdf: { bitstring: string; cumProb: number }[] = [];
  let cum = 0;
  for (const b of bitstrings) {
    cum += probabilities[b];
    cdf.push({ bitstring: b, cumProb: cum });
  }

  for (let s = 0; s < shots; s++) {
    let chosenBitstring = bitstrings[0];
    const rand = Math.random();

    for (const item of cdf) {
      if (rand <= item.cumProb) {
        chosenBitstring = item.bitstring;
        break;
      }
    }

    // Apply noisy bit-flip or leakage if real QPU
    if (isNoisy && Math.random() < noiseLeakRate) {
      // Pick random bit to flip
      const flipIdx = Math.floor(Math.random() * qubitCount);
      const chars = chosenBitstring.split('');
      chars[flipIdx] = chars[flipIdx] === '0' ? '1' : '0';
      chosenBitstring = chars.join('');
    }

    counts[chosenBitstring] = (counts[chosenBitstring] || 0) + 1;
  }

  // Ensure all states exist in counts
  stateEntries.forEach(entry => {
    if (counts[entry.bitstring] === undefined) {
      counts[entry.bitstring] = 0;
    }
  });

  const transpiledDepth = Math.max(1, Math.round(gates.length * (isNoisy ? 1.4 : 1.0)));
  const eplgEstimate = isNoisy ? Math.max(0.92, 0.998 - gates.length * 0.003) : 1.0;

  return {
    shots,
    backendName: profile.name,
    isNoisy,
    counts,
    probabilities,
    executionTimeMs: Math.round(40 + shots * 0.02 + (isNoisy ? 180 : 0)),
    idealCounts,
    transpiledDepth,
    eplgEstimate,
  };
}

// Generate modern Qiskit 2.x python script
export function generateQiskitCode(qubitCount: number, gates: GatePlacement[], shots: number, qpuId: string): string {
  const isNoisy = qpuId !== 'ideal';
  let py = `# QuantumForge Studio - Auto-Generated Modern Qiskit v2 Code
# Compatible with Qiskit 1.x / 2.x & IBM Quantum Cloud

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit.primitives import StatevectorSampler as SamplerV2
from qiskit.quantum_info import SparsePauliOp
import matplotlib.pyplot as plt

# 1. Initialize Circuit (Qubits: q0..q${qubitCount - 1}, Classical Register: meas)
qc = QuantumCircuit(${qubitCount}, ${qubitCount})

# 2. Gate Operations
`;

  gates.forEach(g => {
    const q = g.qubit;
    const t = g.target !== undefined ? g.target : (q + 1) % qubitCount;
    const c2 = g.control2 !== undefined ? g.control2 : (q + 2) % qubitCount;
    const ang = g.angle !== undefined ? g.angle.toFixed(4) : '0';

    switch (g.type) {
      case 'H':
        py += `qc.h(${q})\n`;
        break;
      case 'X':
        py += `qc.x(${q})\n`;
        break;
      case 'Y':
        py += `qc.y(${q})\n`;
        break;
      case 'Z':
        py += `qc.z(${q})\n`;
        break;
      case 'S':
        py += `qc.s(${q})\n`;
        break;
      case 'T':
        py += `qc.t(${q})\n`;
        break;
      case 'RX':
        py += `qc.rx(${ang}, ${q})\n`;
        break;
      case 'RY':
        py += `qc.ry(${ang}, ${q})\n`;
        break;
      case 'RZ':
        py += `qc.rz(${ang}, ${q})\n`;
        break;
      case 'CX':
        py += `qc.cx(${q}, ${t})\n`;
        break;
      case 'CZ':
        py += `qc.cz(${q}, ${t})\n`;
        break;
      case 'SWAP':
        py += `qc.swap(${q}, ${t})\n`;
        break;
      case 'CCX':
        py += `qc.ccx(${q}, ${c2}, ${t})  # High-cost Toffoli gate\n`;
        break;
      case 'M':
        py += `qc.measure(${q}, ${q})\n`;
        break;
    }
  });

  py += `
# 3. Measurement (Measure all qubits to classical register)
qc.measure(range(${qubitCount}), range(${qubitCount}))

# 4. Target Backend & Pass Manager Transpilation
${
  isNoisy
    ? `# Simulated Real QPU: ibm_fez / ibm_pittsburgh Heron ISA
backend = AerSimulator.from_backend("ibm_fez")  # or ibm_pittsburgh
pass_manager = generate_preset_pass_manager(optimization_level=3, backend=backend)
isa_circuit = pass_manager.run(qc)
`
    : `# Ideal AerSimulator
backend = AerSimulator()
pass_manager = generate_preset_pass_manager(optimization_level=1, backend=backend)
isa_circuit = pass_manager.run(qc)
`
}
# 5. Execution with SamplerV2
sampler = SamplerV2(backend)
job = sampler.run([isa_circuit], shots=${shots})
result = job.result()
counts = result[0].data.meas.get_counts()

print("Measurement Counts (Little-Endian: rightmost bit is q0):")
print(counts)
`;

  return py;
}

// Preset Circuit Templates
export interface CircuitPreset {
  id: string;
  name: string;
  description: string;
  qubitCount: number;
  gates: GatePlacement[];
}

export const PRESET_CIRCUITS: CircuitPreset[] = [
  {
    id: 'bell_phi_plus',
    name: '|Φ⁺⟩ Bell State',
    description: '1/√2 (|00⟩ + |11⟩) - Maximal 2-qubit entanglement created via H(0) and CX(0, 1)',
    qubitCount: 2,
    gates: [
      { id: '1', type: 'H', qubit: 0, step: 0 },
      { id: '2', type: 'CX', qubit: 0, target: 1, step: 1 },
    ],
  },
  {
    id: 'bell_psi_minus',
    name: '|Ψ⁻⟩ Singlet Bell State',
    description: '1/√2 (|01⟩ - |10⟩) - Anti-correlated singlet state: H(0), CX(0,1), X(1), Z(0)',
    qubitCount: 2,
    gates: [
      { id: '1', type: 'H', qubit: 0, step: 0 },
      { id: '2', type: 'CX', qubit: 0, target: 1, step: 1 },
      { id: '3', type: 'X', qubit: 1, step: 2 },
      { id: '4', type: 'Z', qubit: 0, step: 3 },
    ],
  },
  {
    id: 'ghz_3qubit',
    name: '3-Qubit GHZ State',
    description: '1/√2 (|000⟩ + |111⟩) - Greenberger–Horne–Zeilinger multipartite entangled state',
    qubitCount: 3,
    gates: [
      { id: '1', type: 'H', qubit: 0, step: 0 },
      { id: '2', type: 'CX', qubit: 0, target: 1, step: 1 },
      { id: '3', type: 'CX', qubit: 1, target: 2, step: 2 },
    ],
  },
  {
    id: 'uncomputation_demo',
    name: 'Reversible Uncomputation Demo',
    description: 'Scratch ancilla q2 computation (AND via CCX) -> phase kickback -> mirror uncomputation',
    qubitCount: 3,
    gates: [
      { id: '1', type: 'H', qubit: 0, step: 0 },
      { id: '2', type: 'H', qubit: 1, step: 0 },
      { id: '3', type: 'CCX', qubit: 0, control2: 1, target: 2, step: 1 },
      { id: '4', type: 'Z', qubit: 2, step: 2 },
      { id: '5', type: 'CCX', qubit: 0, control2: 1, target: 2, step: 3 }, // Uncomputation mirror!
    ],
  },
  {
    id: 'corrupted_ancilla_demo',
    name: '⚠️ Dirty Ancilla Bug (Missing Uncomputation)',
    description: 'Scratch ancilla q2 computes AND(q0,q1) via CCX without mirror uncomputation — corrupting interference!',
    qubitCount: 3,
    gates: [
      { id: '1', type: 'H', qubit: 0, step: 0 },
      { id: '2', type: 'H', qubit: 1, step: 0 },
      { id: '3', type: 'CCX', qubit: 0, control2: 1, target: 2, step: 1 },
      { id: '4', type: 'Z', qubit: 2, step: 2 },
      { id: '5', type: 'H', qubit: 0, step: 3 },
      { id: '6', type: 'H', qubit: 1, step: 3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// STAGE 1 UPGRADE: Reduced Single-Qubit Density Matrices via Partial Trace
// rho_q = Tr_{!= q}(|psi><psi|)
// ---------------------------------------------------------------------------

export function computeReducedDensityMatrices(
  qubitCount: number,
  statevector: StatevectorEntry[]
): ReducedDensityMatrix[] {
  const safeQubitCount = Math.max(1, Math.min(6, qubitCount || 1));
  const dim = 1 << safeQubitCount;
  const results: ReducedDensityMatrix[] = [];

  for (let q = 0; q < safeQubitCount; q++) {
    let rho00Re = 0;
    let rho11Re = 0;
    let rho01 = complex.create(0, 0);

    for (let i = 0; i < dim; i++) {
      const bitQ = (i >> q) & 1;
      const ampI = statevector[i]?.amplitude || complex.create(0, 0);

      if (bitQ === 0) {
        rho00Re += complex.absSq(ampI);
        const partnerIdx = i | (1 << q);
        if (partnerIdx < dim) {
          const ampPartner = statevector[partnerIdx]?.amplitude || complex.create(0, 0);
          // amp_i * conj(amp_{i | 2^q})
          const term = complex.mul(ampI, complex.conjugate(ampPartner));
          rho01 = complex.add(rho01, term);
        }
      } else {
        rho11Re += complex.absSq(ampI);
      }
    }

    const rho10 = complex.conjugate(rho01);
    const rx = Number((2 * rho01.re).toFixed(4));
    const ry = Number((2 * rho10.im).toFixed(4));
    const rz = Number((rho00Re - rho11Re).toFixed(4));

    const rNormSq = rx * rx + ry * ry + rz * rz;
    const rNorm = Math.min(1, Math.sqrt(rNormSq));
    const purity = Number(Math.min(1, Math.max(0.5, 0.5 * (1 + rNormSq))).toFixed(4));

    // von Neumann Entanglement Entropy S(rho_q) = - sum lambda_i log2(lambda_i)
    const lambdaPlus = Math.min(1, Math.max(0, (1 + rNorm) / 2));
    const lambdaMinus = Math.min(1, Math.max(0, (1 - rNorm) / 2));
    const hPlus = lambdaPlus > 1e-7 ? -lambdaPlus * Math.log2(lambdaPlus) : 0;
    const hMinus = lambdaMinus > 1e-7 ? -lambdaMinus * Math.log2(lambdaMinus) : 0;
    const entropy = Number(Math.max(0, hPlus + hMinus).toFixed(4));

    results.push({
      qubit: q,
      rho00: complex.create(Number(rho00Re.toFixed(4)), 0),
      rho01,
      rho10,
      rho11: complex.create(Number(rho11Re.toFixed(4)), 0),
      bloch: { x: rx, y: ry, z: rz },
      purity,
      entropy,
      isEntangled: purity < 0.992,
      probZero: Number(rho00Re.toFixed(4)),
      probOne: Number(rho11Re.toFixed(4)),
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// STAGE 2 UPGRADE: Interactive Ancilla Uncomputation & Interference Debugger
// ---------------------------------------------------------------------------
export function analyzeAncillaCorruption(
  qubitCount: number,
  gates: GatePlacement[],
  ancillaWires: Record<number, boolean>,
  statevector: StatevectorEntry[],
  reducedMatrices: ReducedDensityMatrix[]
): AncillaCorruptionAnalysis[] {
  const warnings: AncillaCorruptionAnalysis[] = [];
  const safeQubitCount = Math.max(1, Math.min(6, qubitCount || 1));
  const dim = 1 << safeQubitCount;

  for (let q = 0; q < safeQubitCount; q++) {
    if (!ancillaWires[q]) continue;
    const rdm = reducedMatrices[q];
    if (!rdm) continue;

    const isEntangled = rdm.purity < 0.992;
    const isNonZero = rdm.probOne > 0.01;

    if (!isEntangled && !isNonZero) continue;

    // Compare output register distribution when ancilla is traced out (corrupted)
    // vs coherent projection if ancilla were uncomputed before interference
    const corruptedOutputProbs: Record<string, number> = {};
    const coherentAmps: Record<string, Complex> = {};

    for (let i = 0; i < dim; i++) {
      const entry = statevector[i];
      if (!entry) continue;
      // Extract work register bitstring by removing ancilla bit q
      const fullBits = entry.bitstring;
      const strIdx = fullBits.length - 1 - q;
      const workBits =
        fullBits.slice(0, strIdx) + fullBits.slice(strIdx + 1) || '0';

      // Incoherent trace-out (measuring/discarding entangled scratch wire)
      corruptedOutputProbs[workBits] =
        (corruptedOutputProbs[workBits] || 0) + entry.probability;

      // Coherent sum (as if scratch wire were uncomputed to |0> coherently)
      coherentAmps[workBits] = complex.add(
        coherentAmps[workBits] || complex.create(0, 0),
        entry.amplitude
      );
    }

    // Normalize coherent probabilities
    let normSum = 0;
    const coherentOutputProbs: Record<string, number> = {};
    Object.entries(coherentAmps).forEach(([wb, amp]) => {
      const p = complex.absSq(amp);
      coherentOutputProbs[wb] = p;
      normSum += p;
    });
    if (normSum > 1e-6) {
      Object.keys(coherentOutputProbs).forEach(wb => {
        coherentOutputProbs[wb] = Number((coherentOutputProbs[wb] / normSum).toFixed(4));
      });
    }
    Object.keys(corruptedOutputProbs).forEach(wb => {
      corruptedOutputProbs[wb] = Number(corruptedOutputProbs[wb].toFixed(4));
    });

    const coherenceLossPct = Math.round((1 - rdm.purity) * 200);

    warnings.push({
      qubit: q,
      probOne: rdm.probOne,
      purity: rdm.purity,
      isEntangled,
      isNonZero,
      coherentOutputProbs,
      corruptedOutputProbs,
      coherenceLossPct: Math.max(coherenceLossPct, Math.round(rdm.probOne * 100)),
      explanation: isEntangled
        ? `Ancilla wire q${q} is entangled with the work register (Purity Tr(ρ²) = ${rdm.purity.toFixed(
            3
          )}, Entropy S = ${rdm.entropy.toFixed(
            2
          )} bits). Discarding or measuring q${q} traces out its state and destroys off-diagonal quantum interference!`
        : `Ancilla wire q${q} was left in non-zero state (P(|1⟩) = ${(rdm.probOne * 100).toFixed(
            1
          )}%). It cannot be cleanly recycled as a |0⟩ scratch wire without uncomputation.`,
    });
  }

  return warnings;
}

// Auto-generate inverse mirror uncomputation gates for dirty ancillas
export function generateMirrorUncomputationGates(
  gates: GatePlacement[],
  ancillaWires: Record<number, boolean>
): GatePlacement[] {
  // Find gates that write to or entangle with any ancilla wire
  const computeGates = gates
    .filter(
      g =>
        g.type !== 'M' &&
        (ancillaWires[g.qubit] ||
          (g.target !== undefined && ancillaWires[g.target]) ||
          (g.control !== undefined && ancillaWires[g.control]) ||
          (g.control2 !== undefined && ancillaWires[g.control2])) &&
        g.type !== 'Z' // Keep phase kickback on target
    )
    .sort((a, b) => b.step - a.step);

  const maxExistingStep = gates.reduce((max, g) => Math.max(max, g.step), 0);
  let nextStep = Math.min(9, maxExistingStep + 1);

  const mirrorGates: GatePlacement[] = computeGates.map((g, idx) => {
    const step = Math.min(9, nextStep + idx);
    let invAngle = g.angle !== undefined ? -g.angle : undefined;
    return {
      ...g,
      id: `uncomp_${Date.now()}_${idx}`,
      step,
      angle: invAngle,
    };
  });

  return [...gates, ...mirrorGates];
}

// ---------------------------------------------------------------------------
// STAGE 4 UPGRADE: Hardware Transpiler & Coupling Topology Mapper
// ---------------------------------------------------------------------------
export function transpileCircuitToHardware(
  qubitCount: number,
  gates: GatePlacement[],
  architecture: 'heron' | 'nighthawk',
  optLevel: number = 3
): TranspiledCircuitReport {
  // Coupling topologies for 6-qubit subgraph
  // Heron (Heavy-Hex): linear chain (0-1-2-3-4-5) + heavy-hex bridge (1-4)
  const heronEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 4],
  ];
  // Nighthawk (Tunable 2x3 Grid): (0-1-2), (3-4-5), vertical (0-3), (1-4), (2-5)
  const nighthawkEdges: [number, number][] = [
    [0, 1],
    [1, 2],
    [3, 4],
    [4, 5],
    [0, 3],
    [1, 4],
    [2, 5],
  ];

  const couplingEdges = architecture === 'heron' ? heronEdges : nighthawkEdges;
  const twoQubitIsaName = architecture === 'heron' ? 'CZ' : 'ECR';

  const isAdjacent = (u: number, v: number) =>
    couplingEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));

  let isaSingleQubitGates = 0;
  let isaTwoQubitGates = 0;
  let insertedSwaps = 0;
  let toffoliDecomposed = 0;
  const decomposedInstructions: TranspiledCircuitReport['decomposedInstructions'] = [];
  const activeCouplingEdges: [number, number][] = [];
  const swapEdges: [number, number][] = [];

  const sortedGates = [...gates].sort((a, b) => a.step - b.step);

  sortedGates.forEach(g => {
    if (g.type === 'M') return;

    if (g.type === 'CCX') {
      toffoliDecomposed++;
      const c1 = g.qubit;
      const c2 = g.control2 ?? (g.qubit + 1) % qubitCount;
      const tgt = g.target ?? (g.qubit + 2) % qubitCount;

      // Standard Clifford+T Toffoli decomposition: 6 2Q gates + 9 1Q gates
      const needsRouting = !isAdjacent(c1, tgt) || !isAdjacent(c2, tgt);
      const swapCount = needsRouting ? (optLevel >= 3 ? 1 : 2) : 0;
      insertedSwaps += swapCount;
      isaTwoQubitGates += 6 + swapCount * 3;
      isaSingleQubitGates += 9 + swapCount * 6;

      activeCouplingEdges.push([Math.min(c1, tgt), Math.max(c1, tgt)]);
      activeCouplingEdges.push([Math.min(c2, tgt), Math.max(c2, tgt)]);
      if (needsRouting) {
        swapEdges.push([Math.min(c1, tgt), Math.max(c1, tgt)]);
      }

      decomposedInstructions.push({
        step: g.step,
        sourceGate: `CCX(q${c1}, q${c2}, q${tgt})`,
        isaSequence: [
          `RZ(π/2) q${tgt}`,
          `SX q${tgt}`,
          `6× ${twoQubitIsaName} + 7× RZ(±π/4) [T/T†]`,
          ...(swapCount > 0 ? [`+${swapCount} SWAP (${swapCount * 3}× ${twoQubitIsaName})`] : []),
        ],
        routingPath: needsRouting
          ? `Routed q${c1}↔q${c2}↔q${tgt} via ${swapCount} SWAP`
          : `Direct Coupling Mapped`,
        isSwapInserted: swapCount > 0,
      });
    } else if (g.type === 'CX' || g.type === 'CZ' || g.type === 'SWAP') {
      const u = g.qubit;
      const v = g.target ?? (g.qubit + 1) % qubitCount;
      const adj = isAdjacent(u, v);
      const swapCount = adj ? 0 : optLevel >= 3 ? 1 : 2;
      insertedSwaps += swapCount;

      if (g.type === 'SWAP') {
        isaTwoQubitGates += 3 + swapCount * 3;
        isaSingleQubitGates += 6;
      } else {
        isaTwoQubitGates += 1 + swapCount * 3;
        isaSingleQubitGates += g.type === 'CX' ? 2 : 0; // H target wraps CZ -> CX
      }

      activeCouplingEdges.push([Math.min(u, v), Math.max(u, v)]);
      if (!adj) {
        swapEdges.push([Math.min(u, v), Math.max(u, v)]);
      }

      decomposedInstructions.push({
        step: g.step,
        sourceGate: `${g.type}(q${u}, q${v})`,
        isaSequence:
          g.type === 'CX'
            ? [
                `RZ(π/2) q${v}`,
                `SX q${v}`,
                `${twoQubitIsaName}(q${u}, q${v})`,
                `SX q${v}`,
                ...(swapCount > 0 ? [`+${swapCount} SWAP Routing`] : []),
              ]
            : [`${twoQubitIsaName}(q${u}, q${v})`],
        routingPath: adj ? `Nearest-Neighbor Link (q${u}-q${v})` : `Non-Local: Inserted ${swapCount} SWAP`,
        isSwapInserted: swapCount > 0,
      });
    } else {
      // Single-qubit gate
      const isCliffordZ = g.type === 'Z' || g.type === 'S' || g.type === 'T' || g.type === 'RZ';
      const pulses = isCliffordZ ? 0 : optLevel >= 2 ? 1 : 2; // Virtual Z gates are 0 physical pulses!
      isaSingleQubitGates += Math.max(1, pulses);
      decomposedInstructions.push({
        step: g.step,
        sourceGate: `${g.type}(q${g.qubit})`,
        isaSequence: isCliffordZ
          ? [`RZ(θ) q${g.qubit} [0-duration Virtual Frame Rotation]`]
          : [`RZ(π/2) q${g.qubit}`, `SX q${g.qubit}`, `RZ(π/2) q${g.qubit}`],
      });
    }
  });

  const optReduction = optLevel === 3 ? 0.82 : optLevel === 2 ? 0.9 : 1.0;
  isaSingleQubitGates = Math.max(0, Math.round(isaSingleQubitGates * optReduction));
  const isaDepth = Math.max(1, Math.round((isaTwoQubitGates * 1.4 + isaSingleQubitGates * 0.4) * optReduction));

  const eplg = architecture === 'heron' ? 0.0018 : 0.0012;
  const twoQError = architecture === 'heron' ? 0.0078 : 0.0052;
  const oneQError = architecture === 'heron' ? 0.00024 : 0.00018;

  const survivalProb = Math.pow(1 - twoQError, isaTwoQubitGates) * Math.pow(1 - oneQError, isaSingleQubitGates);
  const estimatedFidelity = Number(Math.max(0.05, Math.min(1, survivalProb)).toFixed(4));
  const quops = Math.round(1 / Math.max(0.0005, 1 - estimatedFidelity));

  return {
    architecture,
    logicalGates: gates.length,
    isaSingleQubitGates,
    isaTwoQubitGates,
    insertedSwaps,
    toffoliDecomposed,
    isaDepth,
    quops,
    eplg,
    estimatedFidelity,
    decomposedInstructions,
    activeCouplingEdges,
    swapEdges,
  };
}

