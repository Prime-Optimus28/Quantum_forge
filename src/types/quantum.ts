export type GateType =
  | 'H'
  | 'X'
  | 'Y'
  | 'Z'
  | 'S'
  | 'T'
  | 'RX'
  | 'RY'
  | 'RZ'
  | 'CX'
  | 'CZ'
  | 'SWAP'
  | 'CCX'
  | 'M';

export interface GatePlacement {
  id: string;
  type: GateType;
  qubit: number; // primary wire index (0-5)
  step: number; // column time step (0-15)
  target?: number; // for CX, CZ, SWAP, CCX
  control?: number; // for CX, CZ, CCX
  control2?: number; // for CCX (Toffoli second control)
  angle?: number; // for rotation gates RX, RY, RZ in radians
  basis?: 'Z' | 'X' | 'Y'; // for measurement M
}

export interface Complex {
  re: number;
  im: number;
}

export interface StatevectorEntry {
  bitstring: string;
  amplitude: Complex;
  probability: number;
  phase: number; // angle in radians (-PI to PI)
}

export interface ReducedDensityMatrix {
  qubit: number;
  rho00: Complex;
  rho01: Complex;
  rho10: Complex;
  rho11: Complex;
  bloch: { x: number; y: number; z: number };
  purity: number; // Tr(rho^2), 1.0 = pure separable state, 0.5 = maximally entangled
  entropy: number; // von Neumann entanglement entropy S(rho) in bits [0, 1]
  isEntangled: boolean;
  probZero: number;
  probOne: number;
}

export interface AncillaCorruptionAnalysis {
  qubit: number;
  probOne: number;
  purity: number;
  isEntangled: boolean;
  isNonZero: boolean;
  coherentOutputProbs: Record<string, number>;
  corruptedOutputProbs: Record<string, number>;
  coherenceLossPct: number;
  explanation: string;
}

export interface TruthTableRow {
  inputBits: string;
  expectedOutputBits: string;
  actualOutputBits: string;
  fidelity: number;
  ancillaClean: boolean;
  passed: boolean;
}

export interface TranspiledCircuitReport {
  architecture: 'heron' | 'nighthawk';
  logicalGates: number;
  isaSingleQubitGates: number;
  isaTwoQubitGates: number;
  insertedSwaps: number;
  toffoliDecomposed: number;
  isaDepth: number;
  quops: number;
  eplg: number;
  estimatedFidelity: number;
  decomposedInstructions: {
    step: number;
    sourceGate: string;
    isaSequence: string[];
    routingPath?: string;
    isSwapInserted?: boolean;
  }[];
  activeCouplingEdges: [number, number][];
  swapEdges: [number, number][];
}

export interface QPUProfile {
  id: string;
  name: string;
  qubitCount: number;
  qubitTech: string;
  singleQubitError: number;
  twoQubitError: number;
  readoutError: number;
  t1_us: number;
  t2_us: number;
  clops: number;
  queueLength: number;
  status: 'Online' | 'Calibrating' | 'Maintenance';
}

export interface SimulationResult {
  shots: number;
  backendName: string;
  isNoisy: boolean;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  executionTimeMs: number;
  idealCounts: Record<string, number>;
  transpiledDepth: number;
  eplgEstimate: number;
}

export interface BenchmarkPrimitive {
  id: string;
  title: string;
  category: 'Chemistry' | 'Number Theory' | 'Simulation' | 'Arithmetic' | 'Error Correction' | 'Optimization';
  qubits: number;
  baselineGates: number;
  baselineToffoli: number;
  baselineCostScore: number;
  description: string;
  mathematicalTarget: string;
}

export interface ParetoPoint {
  id: string;
  label: string;
  qubits: number;
  gates: number;
  toffoli: number;
  costScore: number;
  category: 'Baseline' | 'AI-Round1' | 'AI-Round2' | 'AI-Round3' | 'Human-Expert';
  description: string;
  isParetoOptimal?: boolean;
}

export interface ExamQuestion {
  id: number;
  question: string;
  category: 'Curriculum' | 'Qiskit' | 'Physics' | 'Optimization';
  options: string[];
  correctIndex: number;
  explanation: string;
}
