import { GatePlacement, GateType } from '../types/quantum';

export interface LessonSection {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  badge: string;
}

export interface MythBuster {
  id: number;
  myth: string;
  reality: string;
  scientificContext: string;
}

export interface InlineCircuitAction {
  id: string;
  label: string; // e.g., "|Φ⁺⟩", "H₀ → CNOT₀,₁", "Uncomputed CCX"
  semanticToken: 'superposition' | 'entanglement' | 'observable' | 'resource';
  description: string;
  qubits: number;
  gates: GatePlacement[];
  ancillaWires?: number[];
  spinParams?: { J: number; hx: number; primitive: 'sampler' | 'estimator' };
}

export interface MicroStep {
  id: string;
  stageNumber: 1 | 2 | 3 | 4;
  stepIndex: number; // 1-based within stage
  title: string;
  subtitle: string;
  paragraphs: string[];
  equationLatex?: string;
  equationCaption?: string;
  inlineActions: InlineCircuitAction[];
  contextualGates: GateType[];
  checkQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LearningStage {
  stageNumber: 1 | 2 | 3 | 4;
  shortTitle: string;
  fullTitle: string;
  steps: MicroStep[];
}

export const LEARNING_STAGES: LearningStage[] = [
  {
    stageNumber: 1,
    shortTitle: '1. First Quantum Program',
    fullTitle: 'Stage 1 — Build & Run Your First Quantum Program',
    steps: [
      {
        id: 's1-step1',
        stageNumber: 1,
        stepIndex: 1,
        title: 'From Classical Bits to Coherent Superposition',
        subtitle: 'Preparing a single qubit in a balanced superposition of |0⟩ and |1⟩',
        paragraphs: [
          'Every qubit wire in a quantum register begins initialized in the ground basis state |0⟩. Unlike a deterministic classical bit that flips strictly between 0 and 1, a quantum wire evolves through unitary operations that rotate its complex probability amplitudes.',
          'Applying a single Hadamard gate (H) to wire q₀ maps |0⟩ into the uniform superposition state |+⟩. Before measurement, the system holds equal complex amplitude 1/√2 on both outcomes; upon measurement in the Z basis, Born’s rule collapses the state with P(0) = 50% and P(1) = 50%.'
        ],
        equationLatex: 'H|0\\rangle = \\frac{1}{\\sqrt{2}}\\big(|0\\rangle + |1\\rangle\\big) = |+\\rangle',
        equationCaption: 'Unitary Hadamard transformation creating a balanced superposition on wire q₀',
        inlineActions: [
          {
            id: 'act-ground',
            label: '|00⟩ Ground State',
            semanticToken: 'observable',
            description: 'Reset 2-qubit register to deterministic |00⟩',
            qubits: 2,
            gates: [{ id: 'g_m0', type: 'M', qubit: 0, step: 1, basis: 'Z' }],
          },
          {
            id: 'act-h0',
            label: 'H₀ → |+⟩ Superposition',
            semanticToken: 'superposition',
            description: 'Apply Hadamard on q₀ to create a 50/50 superposition',
            qubits: 2,
            gates: [
              { id: 'g_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'g_m0', type: 'M', qubit: 0, step: 1, basis: 'Z' },
            ],
          },
          {
            id: 'act-h-cancel',
            label: 'H₀ · H₀ = I (Interference)',
            semanticToken: 'superposition',
            description: 'Two consecutive Hadamards constructively restore |0⟩ via phase cancellation',
            qubits: 2,
            gates: [
              { id: 'g_h0_1', type: 'H', qubit: 0, step: 0 },
              { id: 'g_h0_2', type: 'H', qubit: 0, step: 1 },
              { id: 'g_m0', type: 'M', qubit: 0, step: 2, basis: 'Z' },
            ],
          },
        ],
        contextualGates: ['H', 'CX', 'M'],
        checkQuestion: {
          prompt: 'Why does applying two consecutive Hadamard gates (H followed by H) on |0⟩ always return |0⟩ with 100% probability instead of acting like two independent coin flips?',
          options: [
            'Quantum amplitudes interfere: the negative amplitude on |1⟩ cancels out while |0⟩ constructively reinforces.',
            'The first Hadamard gate fails to execute unless followed by a CNOT gate.',
            'Hardware decoherence resets the qubit back to the ground state.',
          ],
          correctIndex: 0,
          explanation: 'Because H|1⟩ = (|0⟩ - |1⟩)/√2 carries a minus sign, applying H to (|0⟩ + |1⟩)/√2 cancels the |1⟩ component and doubles the |0⟩ component.',
        },
      },
      {
        id: 's1-step2',
        stageNumber: 1,
        stepIndex: 2,
        title: 'Entanglement & The Bell State |Φ⁺⟩',
        subtitle: 'Correlating two qubits with Hadamard and Controlled-NOT (CX)',
        paragraphs: [
          'When we follow a Hadamard gate on q₀ with a Controlled-NOT (CX) gate targeting q₁, the two qubits become maximally entangled in the Bell state |Φ⁺⟩. Neither qubit possesses an independent local state vector anymore—measuring the reduced density matrix ρ₀ reveals a purity Tr(ρ²) = 0.50.',
          'Notice Qiskit’s little-endian convention on the probability chart: the rightmost bit represents q₀ and the leftmost bit represents q₁ (|q₁q₀⟩). In |Φ⁺⟩, only |00⟩ and |11⟩ appear, each with 50% ideal probability.'
        ],
        equationLatex: '|\\Phi^+\\rangle = \\text{CX}_{0,1}(H \\otimes I)|00\\rangle = \\frac{1}{\\sqrt{2}}\\big(|00\\rangle + |11\\rangle\\big)',
        equationCaption: 'Canonical 2-qubit Bell pair creation circuit',
        inlineActions: [
          {
            id: 'act-bell-phi-plus',
            label: 'Load |Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
            semanticToken: 'entanglement',
            description: 'Hadamard on q₀ followed by CX(0 → 1)',
            qubits: 2,
            gates: [
              { id: 'b_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'b_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
            ],
          },
          {
            id: 'act-ghz-3',
            label: 'Load 3-Qubit |GHZ⟩ State',
            semanticToken: 'entanglement',
            description: '3-qubit maximally entangled cat state (|000⟩ + |111⟩)/√2',
            qubits: 3,
            gates: [
              { id: 'ghz_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'ghz_cx1', type: 'CX', qubit: 0, target: 1, step: 1 },
              { id: 'ghz_cx2', type: 'CX', qubit: 1, target: 2, step: 2 },
            ],
          },
        ],
        contextualGates: ['H', 'CX', 'M'],
        checkQuestion: {
          prompt: 'In Qiskit little-endian ordering |q₁q₀⟩, if you prepare |0⟩ on q₁ and apply an X gate only on q₀, which bitstring appears in your measurement dictionary?',
          options: [
            '"01" (because q₀ is the rightmost bit)',
            '"10" (because q₀ is the leftmost bit)',
            '"11" (because X flips all wires)',
          ],
          correctIndex: 0,
          explanation: 'Qiskit places qubit 0 at index 0 from the right (least significant bit), so q₁=0, q₀=1 is written as "01".',
        },
      },
      {
        id: 's1-step3',
        stageNumber: 1,
        stepIndex: 3,
        title: 'Finite-Shot Statistics & Hardware Noise',
        subtitle: 'Why 100 shots differ from 10,000 shots on a real QPU',
        paragraphs: [
          'Real quantum processors do not output a mathematical statevector directly. Instead, the Qiskit SamplerV2 primitive repeats the circuit N times ("shots") and tallies discrete bitstring counts.',
          'With 100 shots, statistical variance follows σ ≈ 1/√N (±5%), so a 50/50 Bell state often lands near 54/46. Furthermore, on noisy superconducting hardware, two-qubit gate errors and readout bit-flips leak small counts into the forbidden |01⟩ and |10⟩ states.'
        ],
        equationLatex: '\\sigma_p = \\sqrt{\\frac{p(1-p)}{N_{\\text{shots}}}} \\propto \\frac{1}{\\sqrt{N_{\\text{shots}}}}',
        equationCaption: 'Standard error of finite-shot Born sampling vs. shot count N',
        inlineActions: [
          {
            id: 'act-bell-meas',
            label: 'Bell Circuit + Z Readout',
            semanticToken: 'entanglement',
            description: 'Bell state with explicit classical measurement gates on both wires',
            qubits: 2,
            gates: [
              { id: 'bm_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'bm_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
              { id: 'bm_m0', type: 'M', qubit: 0, step: 2, basis: 'Z' },
              { id: 'bm_m1', type: 'M', qubit: 1, step: 2, basis: 'Z' },
            ],
          },
        ],
        contextualGates: ['H', 'CX', 'M'],
        checkQuestion: {
          prompt: 'When executing the Bell state |Φ⁺⟩ on a noisy QPU, why do small non-zero bars appear at |01⟩ and |10⟩ in the output chart?',
          options: [
            'Two-qubit CX depolarization and readout bit-flip errors corrupt a small fraction of shots.',
            'The Hadamard gate inherently produces |01⟩ 5% of the time in ideal quantum mechanics.',
            'Qiskit SamplerV2 rounds probabilities to the nearest multiple of 10.',
          ],
          correctIndex: 0,
          explanation: 'Ideal |Φ⁺⟩ has zero amplitude on |01⟩ and |10⟩; their presence in QPU runs is a direct signature of gate decoherence and measurement readout error.',
        },
      },
    ],
  },
  {
    stageNumber: 2,
    shortTitle: '2. Quantum Math Basics',
    fullTitle: 'Stage 2 — Quantum Mechanics & Linear Algebra Basics',
    steps: [
      {
        id: 's2-step1',
        stageNumber: 2,
        stepIndex: 1,
        title: 'Pauli Operators & Relative Phase',
        subtitle: 'Bit flips (X), phase flips (Z), and complex phase gates (S, T)',
        paragraphs: [
          'Every single-qubit gate is a 2×2 unitary matrix U satisfying U†U = I. The Pauli-X gate acts as a quantum NOT gate, swapping the amplitudes of |0⟩ and |1⟩. The Pauli-Z gate leaves |0⟩ unchanged and multiplies |1⟩ by a relative phase of -1 (e^{iπ}).',
          'Relative phase is invisible if you measure directly in the Z basis because |-1/√2|² = |+1/√2|² = 0.50. However, transforming back with an H gate or measuring in the X basis converts that phase difference into a 100% deterministic outcome flip.'
        ],
        equationLatex: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
        equationCaption: 'Unitary matrices for bit-flip (X), phase-flip (Z), and π/2 phase (S) gates',
        inlineActions: [
          {
            id: 'act-plus-state',
            label: '|+⟩ = H|0⟩ (Phase 0°)',
            semanticToken: 'superposition',
            description: 'Prepare |+⟩ with constructive +1 phase on |1⟩',
            qubits: 2,
            gates: [{ id: 'p_h0', type: 'H', qubit: 0, step: 0 }],
          },
          {
            id: 'act-minus-state',
            label: '|−⟩ = Z·H|0⟩ (Phase 180°)',
            semanticToken: 'superposition',
            description: 'Apply Z after H to flip the relative phase of |1⟩ to -1',
            qubits: 2,
            gates: [
              { id: 'm_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'm_z0', type: 'Z', qubit: 0, step: 1 },
            ],
          },
          {
            id: 'act-hz-h',
            label: 'H · Z · H = X (Phase-to-Bit Flip)',
            semanticToken: 'observable',
            description: 'Sandwiching Z between two Hadamards turns a phase flip into a 100% bit flip |1⟩',
            qubits: 2,
            gates: [
              { id: 'hzh_1', type: 'H', qubit: 0, step: 0 },
              { id: 'hzh_2', type: 'Z', qubit: 0, step: 1 },
              { id: 'hzh_3', type: 'H', qubit: 0, step: 2 },
            ],
          },
        ],
        contextualGates: ['H', 'X', 'Y', 'Z', 'S', 'T', 'CX', 'M'],
        checkQuestion: {
          prompt: 'The states |+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2 both yield 50% |0⟩ and 50% |1⟩ when measured in the Z basis. How can you distinguish them with 100% certainty in a single shot?',
          options: [
            'Measure in the X basis (or apply H before Z-measurement), which maps |+⟩ → |0⟩ and |−⟩ → |1⟩.',
            'Run 10,000 shots in the Z basis and compare standard deviations.',
            'Apply a Pauli-Z gate immediately before Z-basis readout.',
          ],
          correctIndex: 0,
          explanation: 'Measuring in the X basis applies a basis rotation H prior to Z readout, turning the ±1 relative phase into orthogonal computational states |0⟩ and |1⟩.',
        },
      },
      {
        id: 's2-step2',
        stageNumber: 2,
        stepIndex: 2,
        title: 'The Four Orthogonal Bell States',
        subtitle: 'Navigating the 2-qubit maximally entangled basis via local Pauli gates',
        paragraphs: [
          'Remarkably, applying a local single-qubit Pauli operation (X or Z) to just one wire of the Bell pair |Φ⁺⟩ transforms the entire global 2-qubit state into one of the four orthogonal Bell states: |Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, or |Ψ⁻⟩.',
          'Click each Bell state badge below and inspect the "Dirac & Statevector" tab on the right to see how the complex amplitudes and signs shift between correlated (|00⟩, |11⟩) and anti-correlated (|01⟩, |10⟩) pairs.'
        ],
        equationLatex: '|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}\\big(|01\\rangle - |10\\rangle\\big) = (Z \\otimes X)|\\Phi^+\\rangle',
        equationCaption: 'The spin-singlet Bell state |Ψ⁻⟩ with anti-correlated spins and negative relative phase',
        inlineActions: [
          {
            id: 'act-bell-phi-p',
            label: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
            semanticToken: 'entanglement',
            description: 'Even parity, positive phase Bell state',
            qubits: 2,
            gates: [
              { id: 'bp_h', type: 'H', qubit: 0, step: 0 },
              { id: 'bp_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
            ],
          },
          {
            id: 'act-bell-phi-m',
            label: '|Φ⁻⟩ = (|00⟩ − |11⟩)/√2',
            semanticToken: 'entanglement',
            description: 'Even parity, negative phase Bell state (Z after Bell)',
            qubits: 2,
            gates: [
              { id: 'bm_h', type: 'H', qubit: 0, step: 0 },
              { id: 'bm_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
              { id: 'bm_z', type: 'Z', qubit: 0, step: 2 },
            ],
          },
          {
            id: 'act-bell-psi-p',
            label: '|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2',
            semanticToken: 'entanglement',
            description: 'Odd parity, positive phase Bell state (X on target)',
            qubits: 2,
            gates: [
              { id: 'psp_h', type: 'H', qubit: 0, step: 0 },
              { id: 'psp_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
              { id: 'psp_x', type: 'X', qubit: 1, step: 2 },
            ],
          },
          {
            id: 'act-bell-psi-m',
            label: '|Ψ⁻⟩ = (|01⟩ − |10⟩)/√2',
            semanticToken: 'entanglement',
            description: 'Antiferromagnetic singlet state |Ψ⁻⟩',
            qubits: 2,
            gates: [
              { id: 'psm_x0', type: 'X', qubit: 0, step: 0 },
              { id: 'psm_x1', type: 'X', qubit: 1, step: 0 },
              { id: 'psm_h0', type: 'H', qubit: 0, step: 1 },
              { id: 'psm_cx', type: 'CX', qubit: 0, target: 1, step: 2 },
            ],
          },
        ],
        contextualGates: ['H', 'X', 'Y', 'Z', 'S', 'T', 'CX', 'CZ', 'M'],
        checkQuestion: {
          prompt: 'Which gate sequence transforms |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 into the singlet state |Ψ⁻⟩ = (|01⟩ − |10⟩)/√2?',
          options: [
            'Apply X on q₁ to flip parity to (|01⟩ + |10⟩)/√2, and Z on q₀ to introduce the minus phase.',
            'Apply another Hadamard gate on both qubits.',
            'Apply a S gate on q₀ and measure in the Z basis.',
          ],
          correctIndex: 0,
          explanation: 'X on one qubit swaps |00⟩+|11⟩ into |01⟩+|10⟩, and Z on one qubit flips the sign of the term where that qubit is in state |1⟩.',
        },
      },
    ],
  },
  {
    stageNumber: 3,
    shortTitle: '3. Two-Spin Experiment',
    fullTitle: 'Stage 3 — Your First Quantum Experiment: Two Interacting Spins',
    steps: [
      {
        id: 's3-step1',
        stageNumber: 3,
        stepIndex: 1,
        title: 'The Antiferromagnetic Heisenberg Spin Hamiltonian',
        subtitle: 'Mapping two coupled electron spins onto qubits with Qiskit Patterns',
        paragraphs: [
          'In quantum magnetism, two neighboring electron spins with antiferromagnetic exchange coupling (J > 0) prefer to align anti-parallel. However, quantum mechanics goes further than classical Néel states (↑↓ or ↓↑): the true lowest-energy ground state is the entangled spin-singlet |Ψ⁻⟩.',
          'Using the Hamiltonian controls in the stage toolbar on the right, adjust the coupling strength J and transverse field hₓ, or click the trial states below to compare the energy expectation value ⟨ψ|H|ψ⟩.'
        ],
        equationLatex: '\\hat{H} = J\\big(X_0 X_1 + Y_0 Y_1 + Z_0 Z_1\\big) + h_x\\big(X_0 + X_1\\big)',
        equationCaption: 'Two-spin Heisenberg exchange Hamiltonian with transverse magnetic field hₓ',
        inlineActions: [
          {
            id: 'act-spin-ferro',
            label: 'Trial |00⟩ (Ferromagnetic ↑↑, E = +J)',
            semanticToken: 'observable',
            description: 'Parallel spins yield high energy +J for antiferromagnetic coupling',
            qubits: 2,
            gates: [],
            spinParams: { J: 1.0, hx: 0.0, primitive: 'estimator' },
          },
          {
            id: 'act-spin-neel',
            label: 'Trial |01⟩ (Classical Néel ↑↓, E = −J)',
            semanticToken: 'observable',
            description: 'Unentangled anti-parallel state achieves E = -J but misses XX and YY lowers',
            qubits: 2,
            gates: [{ id: 'neel_x', type: 'X', qubit: 0, step: 0 }],
            spinParams: { J: 1.0, hx: 0.0, primitive: 'estimator' },
          },
          {
            id: 'act-spin-singlet',
            label: 'Singlet |Ψ⁻⟩ (True Ground State, E = −3J)',
            semanticToken: 'entanglement',
            description: 'Entangled singlet minimizes ⟨XX⟩ = ⟨YY⟩ = ⟨ZZ⟩ = -1 Simultaneously → E = -3J',
            qubits: 2,
            gates: [
              { id: 'sg_x0', type: 'X', qubit: 0, step: 0 },
              { id: 'sg_x1', type: 'X', qubit: 1, step: 0 },
              { id: 'sg_h0', type: 'H', qubit: 0, step: 1 },
              { id: 'sg_cx', type: 'CX', qubit: 0, target: 1, step: 2 },
            ],
            spinParams: { J: 1.0, hx: 0.0, primitive: 'estimator' },
          },
        ],
        contextualGates: ['H', 'X', 'Y', 'Z', 'RX', 'RY', 'RZ', 'CX', 'CZ', 'M'],
        checkQuestion: {
          prompt: 'For the isotropic antiferromagnetic Hamiltonian H = J(XX + YY + ZZ) with J = 1, why is the entangled singlet |Ψ⁻⟩ lower in energy (E = -3) than the classical anti-parallel state |01⟩ (E = -1)?',
          options: [
            '|Ψ⁻⟩ is a simultaneous eigenstate of XX, YY, and ZZ with eigenvalue -1 on all three axes.',
            '|Ψ⁻⟩ turns off the Z₀Z₁ interaction term completely.',
            'Classical states cannot be prepared on superconducting qubits.',
          ],
          correctIndex: 0,
          explanation: 'While |01⟩ has ⟨ZZ⟩ = -1 and ⟨XX⟩ = ⟨YY⟩ = 0 (giving E = -1), the entangled singlet |Ψ⁻⟩ achieves ⟨XX⟩ = ⟨YY⟩ = ⟨ZZ⟩ = -1, lowering the energy to -3J.',
        },
      },
      {
        id: 's3-step2',
        stageNumber: 3,
        stepIndex: 2,
        title: 'SamplerV2 vs. EstimatorV2 in Qiskit Patterns',
        subtitle: 'Choosing between shot bitstrings and SparsePauliOp expectation values',
        paragraphs: [
          'Every modern Qiskit workflow follows the 4-step Qiskit Patterns architecture: (1) Map problem to quantum circuits & operators, (2) Optimize for target hardware ISA, (3) Execute via Qiskit Primitives, and (4) Post-process results.',
          'Toggle between SamplerV2 and EstimatorV2 in the stage toolbar on the right: SamplerV2 returns shot counts over computational basis bitstrings, whereas EstimatorV2 decomposes a SparsePauliOp Hamiltonian and computes ⟨ψ|H|ψ⟩ directly.'
        ],
        equationLatex: '\\langle \\hat{H} \\rangle = J\\big(\\langle X_0 X_1 \\rangle + \\langle Y_0 Y_1 \\rangle + \\langle Z_0 Z_1 \\rangle\\big) + h_x\\langle X_0 + X_1 \\rangle',
        equationCaption: 'EstimatorV2 linear combination of Pauli expectation values',
        inlineActions: [
          {
            id: 'act-vqe-ansatz',
            label: 'Load Parameterized RY(θ) Singlet Ansatz',
            semanticToken: 'superposition',
            description: 'Variational RY rotation + CX entanglement circuit for EstimatorV2 sweeps',
            qubits: 2,
            gates: [
              { id: 'vqe_x1', type: 'X', qubit: 1, step: 0 },
              { id: 'vqe_ry0', type: 'RY', qubit: 0, step: 0, angle: -Math.PI / 2 },
              { id: 'vqe_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
            ],
            spinParams: { J: 1.0, hx: 0.25, primitive: 'estimator' },
          },
        ],
        contextualGates: ['H', 'X', 'Y', 'Z', 'RX', 'RY', 'RZ', 'CX', 'CZ', 'M'],
        checkQuestion: {
          prompt: 'In Qiskit v2, which primitive should you call when your scientific goal is to compute the ground-state energy ⟨ψ(θ)|H|ψ(θ)⟩ of a SparsePauliOp Hamiltonian?',
          options: [
            'EstimatorV2',
            'SamplerV2',
            'TranspilerV2',
          ],
          correctIndex: 0,
          explanation: 'EstimatorV2 handles basis rotations for non-commuting Pauli strings (XX, YY, ZZ) and returns expectation values and standard errors.',
        },
      },
    ],
  },
  {
    stageNumber: 4,
    shortTitle: '4. AI Circuit Efficiency',
    fullTitle: 'Stage 4 — AI-Driven Circuit Efficiency & Reversible Uncomputation',
    steps: [
      {
        id: 's4-step1',
        stageNumber: 4,
        stepIndex: 1,
        title: 'Reversible Logic & The Ancilla Uncomputation Trap',
        subtitle: 'Why dirty scratch qubits destroy quantum interference',
        paragraphs: [
          'Multi-controlled arithmetic and oracle circuits frequently compute intermediate values (such as a₀ ∧ a₁) into an ancilla scratch wire using a Toffoli (CCX) gate. However, if you leave that scratch qubit non-zero or entangled with your data register at the end of the subroutine, tracing out or discarding the ancilla collapses coherent superpositions.',
          'Compare the "Corrupted Ancilla" vs. "Mirror Uncomputed (U†)" circuits below. Notice the warning banner and how applying the inverse CCX gate restores ancilla purity to 1.00 while preserving your target answer.'
        ],
        equationLatex: 'U_{\\text{compute}} |x\\rangle |0\\rangle_{\\text{anc}} |0\\rangle_{\\text{out}} \\xrightarrow{U_{\\text{compute}}^\\dagger} |x\\rangle |0\\rangle_{\\text{anc}} |f(x)\\rangle_{\\text{out}}',
        equationCaption: 'Bennett’s reversible uncomputation pattern restoring ancilla scratch wires to |0⟩',
        inlineActions: [
          {
            id: 'act-ancilla-dirty',
            label: 'Load Dirty Ancilla Bug (q₂ Left Entangled)',
            semanticToken: 'resource',
            description: 'Superposition inputs + CCX into scratch q₂ without uncomputing q₂',
            qubits: 4,
            ancillaWires: [2],
            gates: [
              { id: 'ad_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'ad_h1', type: 'H', qubit: 1, step: 0 },
              { id: 'ad_ccx1', type: 'CCX', qubit: 2, control: 0, control2: 1, step: 1 },
              { id: 'ad_cx_out', type: 'CX', qubit: 2, target: 3, step: 2 },
            ],
          },
          {
            id: 'act-ancilla-clean',
            label: 'Load Clean U† Uncomputed Circuit',
            semanticToken: 'observable',
            description: 'Mirror CCX uncomputes scratch wire q₂ back to |0⟩ cleanly',
            qubits: 4,
            ancillaWires: [2],
            gates: [
              { id: 'ac_h0', type: 'H', qubit: 0, step: 0 },
              { id: 'ac_h1', type: 'H', qubit: 1, step: 0 },
              { id: 'ac_ccx1', type: 'CCX', qubit: 2, control: 0, control2: 1, step: 1 },
              { id: 'ac_cx_out', type: 'CX', qubit: 2, target: 3, step: 2 },
              { id: 'ac_ccx2', type: 'CCX', qubit: 2, control: 0, control2: 1, step: 3 },
            ],
          },
        ],
        contextualGates: ['H', 'X', 'Z', 'CX', 'CZ', 'SWAP', 'CCX', 'M'],
        checkQuestion: {
          prompt: 'What happens to a quantum algorithm if an ancilla scratch qubit remains entangled with the computational register and is discarded or reset mid-circuit?',
          options: [
            'It acts as an implicit projective measurement, destroying phase coherence and interference on the output register.',
            'It speeds up the circuit by reducing the total number of wires.',
            'It has no effect as long as you do not place an explicit M gate on the scratch wire.',
          ],
          correctIndex: 0,
          explanation: 'By the principle of implicit measurement, any environment or ancilla wire entangled with your system decoheres the reduced density matrix of the output qubits.',
        },
      },
      {
        id: 's4-step2',
        stageNumber: 4,
        stepIndex: 2,
        title: 'Closed-Loop AI Synthesis & The Qubits × Gates Frontier',
        subtitle: 'How language models paired with deterministic verifiers compress quantum circuits',
        paragraphs: [
          'Each 3-qubit Toffoli (CCX) gate decomposes into 6 two-qubit CNOT gates plus 9 single-qubit phase gates on physical hardware. In Anthropic’s research on quantum circuit efficiency, pairing an AI model with an exact unitary/truth-table evaluator in a closed feedback loop discovers algebraic cancellations that slash the Qubits × Gates score.',
          'Load the redundant circuit below, open the "Resource Score" tab at the bottom of the right stage, and click "Optimize with Gemini" to run a live 3-round verification and synthesis loop.'
        ],
        equationLatex: '\\text{Cost Score} = N_{\\text{qubits}} \\times \\big(N_{\\text{1Q/2Q}} + 6 \\cdot N_{\\text{Toffoli}}\\big)',
        equationCaption: 'Hardware-weighted space-time circuit volume metric',
        inlineActions: [
          {
            id: 'act-redundant-circuit',
            label: 'Load Unoptimized Toffoli + Redundant Pair Circuit',
            semanticToken: 'resource',
            description: 'Circuit with redundant H·H and unoptimized 3-qubit Toffoli sequence ready for Gemini optimization',
            qubits: 3,
            gates: [
              { id: 'opt_h0_a', type: 'H', qubit: 0, step: 0 },
              { id: 'opt_h0_b', type: 'H', qubit: 0, step: 1 },
              { id: 'opt_x0', type: 'X', qubit: 0, step: 2 },
              { id: 'opt_x1', type: 'X', qubit: 1, step: 2 },
              { id: 'opt_ccx', type: 'CCX', qubit: 2, control: 0, control2: 1, step: 3 },
              { id: 'opt_cx1', type: 'CX', qubit: 0, target: 1, step: 4 },
              { id: 'opt_cx2', type: 'CX', qubit: 0, target: 1, step: 5 },
            ],
          },
        ],
        contextualGates: ['H', 'X', 'Y', 'Z', 'S', 'T', 'CX', 'CZ', 'SWAP', 'CCX', 'M'],
        checkQuestion: {
          prompt: 'Why is a fast, deterministic mathematical verifier essential when using an LLM to optimize quantum circuits?',
          options: [
            'Even a single misplaced phase or CNOT alters the 2ⁿ×2ⁿ unitary matrix; the verifier guarantees exact equivalence while scoring Qubits × Gates.',
            'LLMs cannot output JSON arrays without a verifier.',
            'The verifier increases the physical clock frequency of the QPU.',
          ],
          correctIndex: 0,
          explanation: 'Quantum circuits are fragile—small gate edits easily break functional equivalence. Closed-loop verification filters out invalid candidates and guides iterative compression.',
        },
      },
    ],
  },
];

export const LESSONS: LessonSection[] = [
  {
    id: 'lesson1',
    title: 'Lesson 1 — Build & Run Your First Quantum Program',
    subtitle: 'Qubits, Superposition, Entanglement, and Shot Statistics',
    durationMinutes: 15,
    badge: 'Foundations',
  },
  {
    id: 'lesson2',
    title: 'Lesson 2 — Quantum Mechanics Basics',
    subtitle: 'Matrix-Vector State Evolution, Phase Wheels & Pauli Observables',
    durationMinutes: 20,
    badge: 'Linear Algebra',
  },
  {
    id: 'lesson3',
    title: 'Lesson 3 — Your First Quantum Experiment: Two Interacting Spins',
    subtitle: 'Antiferromagnetic Hamiltonian, Qiskit Patterns & Ground State Discovery',
    durationMinutes: 25,
    badge: 'Physics Lab',
  },
  {
    id: 'lesson4',
    title: 'Lesson 4 — Quantum Computing Context & Hardware Metrics',
    subtitle: 'Scale, Quality, Speed, Myth-Busting & Fault-Tolerant Architectures',
    durationMinutes: 20,
    badge: 'Hardware & Context',
  },
];

export const MYTH_BUSTERS: MythBuster[] = [
  {
    id: 1,
    myth: 'Quantum computers calculate every possible answer simultaneously in parallel universes.',
    reality: 'Quantum computers evaluate an entire superposition coherently, but a measurement yields only ONE outcome according to Born probabilities.',
    scientificContext: 'Quantum speedups require constructive interference (reinforcing the correct answer amplitude) and destructive interference (canceling incorrect answers), not brute-force parallel classical testing.',
  },
  {
    id: 2,
    myth: 'Quantum computers will soon replace everyday classical laptop and desktop CPUs.',
    reality: 'Quantum processors (QPUs) are specialized domain accelerators, tightly integrated in hybrid workflows with classical CPUs.',
    scientificContext: 'Classical architectures excel at sequential logic, branch prediction, and memory caching. QPUs excel at specific polynomial or exponential speedups: quantum chemistry simulation, integer factorization, and Hamiltonian evolution.',
  },
  {
    id: 3,
    myth: 'The quantum processor with the most raw qubits is always the most capable.',
    reality: 'Qubit quality, gate fidelity, two-qubit error rates, and connectivity topology matter far more than raw qubit count.',
    scientificContext: 'A 1,000-qubit device with 2% gate error cannot run deep circuits because noise overwhelms the signal before step 50. IBM Heron (156 qubits) with 0.7% error out-performs older Eagle (127 qubits) systems.',
  },
  {
    id: 4,
    myth: 'Quantum entanglement enables faster-than-light (FTL) instantaneous communication.',
    reality: 'Entangled measurements are correlated instantaneously, but conveying usable information requires a classical subluminal channel.',
    scientificContext: 'The No-Communication Theorem in quantum mechanics proves that local measurements on an entangled subsystem cannot transmit messages faster than light (preserving relativistic causality).',
  },
  {
    id: 5,
    myth: 'Quantum computers can solve NP-Complete problems instantaneously.',
    reality: 'No known polynomial-time quantum algorithm exists for NP-Complete problems (BQP is not believed to contain NP-Complete).',
    scientificContext: "Grover's algorithm provides a quadratic speedup (O(√N)), which is powerful for unstructured search, but not an exponential solve for NP-complete problems.",
  },
  {
    id: 6,
    myth: 'Error mitigation and error correction are the exact same thing.',
    reality: 'Error mitigation reduces expectation-value noise without physical qubit expansion; Error correction uses topological codes for fault tolerance.',
    scientificContext: 'Error mitigation (ZNE, TREX) runs multiple noisy circuits and extrapolates clean results on today’s NISQ hardware. Error correction (surface codes) entangles thousands of physical qubits into single protected logical qubits.',
  },
];
