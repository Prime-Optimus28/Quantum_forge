import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Code2,
  Sigma,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import {
  GatePlacement,
  GateType,
  StatevectorEntry,
} from '../../types/quantum';
import {
  generateQiskitCode,
  computeReducedDensityMatrices,
  transpileCircuitToHardware,
} from '../../utils/quantumEngine';

interface InspectCodeMathDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'code' | 'math' | 'topology';
  selectedGateType?: GateType | null;
  qubitCount: number;
  gates: GatePlacement[];
  statevector: StatevectorEntry[];
  shots: number;
  isDark: boolean;
}

const GATE_UNITARIES: Record<
  GateType,
  { name: string; latex: string; matrix: string[][]; description: string }
> = {
  H: {
    name: 'Hadamard Gate (H)',
    latex: 'H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
    matrix: [
      ['0.707', '0.707'],
      ['0.707', '-0.707'],
    ],
    description: 'Maps computational basis states |0⟩ and |1⟩ to equal superpositions |+⟩ and |−⟩.',
  },
  X: {
    name: 'Pauli-X Gate (Bit Flip / NOT)',
    latex: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
    matrix: [
      ['0', '1'],
      ['1', '0'],
    ],
    description: 'π radian rotation around the Bloch X-axis; swaps amplitudes of |0⟩ and |1⟩.',
  },
  Y: {
    name: 'Pauli-Y Gate (Bit & Phase Flip)',
    latex: 'Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
    matrix: [
      ['0', '-i'],
      ['+i', '0'],
    ],
    description: 'π radian rotation around the Bloch Y-axis.',
  },
  Z: {
    name: 'Pauli-Z Gate (Phase Flip)',
    latex: 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
    matrix: [
      ['1', '0'],
      ['0', '-1'],
    ],
    description: 'Leaves |0⟩ unchanged and multiplies |1⟩ by e^{iπ} = -1.',
  },
  S: {
    name: 'Phase Gate S (√Z)',
    latex: 'S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
    matrix: [
      ['1', '0'],
      ['0', '+i'],
    ],
    description: 'Adds a π/2 (90°) relative phase to |1⟩.',
  },
  T: {
    name: 'T Gate (π/8 Phase / √S)',
    latex: 'T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
    matrix: [
      ['1', '0'],
      ['0', '0.707 + 0.707i'],
    ],
    description: 'Non-Clifford π/4 (45°) phase gate essential for universal fault-tolerant quantum computing.',
  },
  RX: {
    name: 'Rotation-X Gate RX(θ)',
    latex: 'R_X(\\theta) = \\begin{pmatrix} \\cos(\\theta/2) & -i\\sin(\\theta/2) \\\\ -i\\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}',
    matrix: [
      ['cos(θ/2)', '-i·sin(θ/2)'],
      ['-i·sin(θ/2)', 'cos(θ/2)'],
    ],
    description: 'Continuous coherent rotation by angle θ around the X-axis.',
  },
  RY: {
    name: 'Rotation-Y Gate RY(θ)',
    latex: 'R_Y(\\theta) = \\begin{pmatrix} \\cos(\\theta/2) & -\\sin(\\theta/2) \\\\ \\sin(\\theta/2) & \\cos(\\theta/2) \\end{pmatrix}',
    matrix: [
      ['cos(θ/2)', '-sin(θ/2)'],
      ['sin(θ/2)', 'cos(θ/2)'],
    ],
    description: 'Real-valued amplitude rotation around the Y-axis, frequently used in VQE trial ansätze.',
  },
  RZ: {
    name: 'Rotation-Z Gate RZ(θ)',
    latex: 'R_Z(\\theta) = \\begin{pmatrix} e^{-i\\theta/2} & 0 \\\\ 0 & e^{i\\theta/2} \\end{pmatrix}',
    matrix: [
      ['e^{-iθ/2}', '0'],
      ['0', 'e^{+iθ/2}'],
    ],
    description: 'Virtual Z-phase rotation implemented at zero duration in superconducting control electronics.',
  },
  CX: {
    name: 'Controlled-NOT Gate (CX / CNOT)',
    latex: '\\text{CX} = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '0', '1'],
      ['0', '0', '1', '0'],
    ],
    description: 'Two-qubit entangling gate: flips target qubit if and only if the control qubit is in state |1⟩.',
  },
  CZ: {
    name: 'Controlled-Z Gate (CZ)',
    latex: '\\text{CZ} = \\text{diag}(1, 1, 1, -1)',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '1', '0'],
      ['0', '0', '0', '-1'],
    ],
    description: 'Native two-qubit gate on IBM Heron processors; applies a -1 phase when both qubits are |11⟩.',
  },
  SWAP: {
    name: 'SWAP Gate (2-Qubit Exchange)',
    latex: '\\text{SWAP} = \\text{CX}_{0,1} \\cdot \\text{CX}_{1,0} \\cdot \\text{CX}_{0,1}',
    matrix: [
      ['1', '0', '0', '0'],
      ['0', '0', '1', '0'],
      ['0', '1', '0', '0'],
      ['0', '0', '0', '1'],
    ],
    description: 'Exchanges the quantum states of two wires; decomposes into 3 consecutive CNOT gates.',
  },
  CCX: {
    name: 'Toffoli Gate (CCX / Controlled-Controlled-NOT)',
    latex: '\\text{CCX}|c_1, c_2, t\\rangle = |c_1, c_2, t \\oplus (c_1 \\wedge c_2)\\rangle',
    matrix: [
      ['I₆', '0'],
      ['0', 'X₂'],
    ],
    description: '3-qubit reversible AND gate; requires 6 two-qubit CNOTs + 9 single-qubit T/H gates in hardware.',
  },
  M: {
    name: 'Projective Basis Measurement (M)',
    latex: 'P_0 = |0\\rangle\\langle 0|, \\quad P_1 = |1\\rangle\\langle 1|',
    matrix: [
      ['P(0) = |α|²', '0'],
      ['0', 'P(1) = |β|²'],
    ],
    description: 'Non-unitary Born projection onto the chosen measurement basis (Z, X, or Y).',
  },
};

export const InspectCodeMathDrawer: React.FC<InspectCodeMathDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'code',
  selectedGateType,
  qubitCount,
  gates,
  statevector,
  shots,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'math' | 'topology'>(initialTab);
  const [inspectedGate, setInspectedGate] = useState<GateType>(selectedGateType || 'H');
  const [arch, setArch] = useState<'heron' | 'nighthawk'>('heron');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (selectedGateType) {
      setInspectedGate(selectedGateType);
      setActiveTab('math');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [selectedGateType, initialTab, isOpen]);

  const qiskitCode = useMemo(
    () => generateQiskitCode(qubitCount, gates, shots, 'ibm_fez'),
    [qubitCount, gates, shots]
  );

  const estimatorSnippet = useMemo(
    () =>
      `# EstimatorV2 SparsePauliOp Spin Hamiltonian Pattern\nfrom qiskit.quantum_info import SparsePauliOp\nfrom qiskit_ibm_runtime import EstimatorV2 as Estimator\n\nhamiltonian = SparsePauliOp.from_list([\n    ("XX", 1.0), ("YY", 1.0), ("ZZ", 1.0), ("XI", 0.25), ("IX", 0.25)\n])\nestimator = Estimator(mode=backend)\npub = (isa_circuit, [hamiltonian.apply_layout(isa_circuit.layout)])\nenergy_ev = estimator.run([pub]).result()[0].data.evs[0]`,
    []
  );

  const reducedMatrices = useMemo(
    () => computeReducedDensityMatrices(qubitCount, statevector),
    [qubitCount, statevector]
  );

  const transpiledReport = useMemo(
    () => transpileCircuitToHardware(qubitCount, gates, arch),
    [qubitCount, gates, arch]
  );

  if (!isOpen) return null;

  const unitaryInfo = GATE_UNITARIES[inspectedGate] || GATE_UNITARIES.H;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${qiskitCode}\n\n${estimatorSnippet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Coordinates for 6-qubit topology visualization
  const nodePositions: Record<number, { x: number; y: number }> = {
    0: { x: 60, y: 50 },
    1: { x: 160, y: 50 },
    2: { x: 260, y: 50 },
    3: { x: 260, y: 130 },
    4: { x: 160, y: 130 },
    5: { x: 60, y: 130 },
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
      <aside
        className={`flex h-full w-full max-w-xl flex-col border-l shadow-2xl transition-colors ${
          isDark
            ? 'bg-[#090D16] border-white/10 text-[#F8FAFC]'
            : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#0F172A]'
        }`}
      >
        {/* Top Drawer Bar */}
        <div
          className={`flex items-center justify-between border-b px-5 py-3.5 ${
            isDark ? 'border-white/[0.07]' : 'border-[#E5E7EB]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">
              Code, Linear Algebra & ISA Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className={`rounded-md p-1 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Segmented Sub-Tabs */}
        <div
          className={`flex items-center gap-1 border-b px-5 py-2 ${
            isDark ? 'border-white/[0.07] bg-[#111827]/60' : 'border-[#E5E7EB] bg-[#FAF9F6]'
          }`}
        >
          {[
            { id: 'code', label: 'Qiskit v2 Code', icon: Code2 },
            { id: 'math', label: 'Unitary & Density ρ', icon: Sigma },
            { id: 'topology', label: 'Hardware ISA & Coupling', icon: Cpu },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'code' | 'math' | 'topology')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? isDark
                      ? 'bg-[#1E293B] text-[#38BDF8]'
                      : 'bg-[#FFFFFF] text-[#0284C7] shadow-2xs border border-[#E5E7EB]'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Live-Synced Qiskit SDK v2.0 Script
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
                    Includes generate_preset_pass_manager, SamplerV2, and EstimatorV2 primitives.
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isDark
                      ? 'bg-[#111827] border-white/10 text-slate-200 hover:border-white/20'
                      : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#0D9488]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Python</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className={`overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed ${
                  isDark
                    ? 'bg-[#111827] border-white/[0.07] text-slate-200'
                    : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#0F172A]'
                }`}
              >
                {qiskitCode}
              </pre>

              <div className="pt-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                  EstimatorV2 SparsePauliOp Pattern
                </h5>
                <pre
                  className={`overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed ${
                    isDark
                      ? 'bg-[#111827] border-white/[0.07] text-slate-300'
                      : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#0F172A]'
                  }`}
                >
                  {estimatorSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'math' && (
            <div className="space-y-6">
              {/* Gate Selector */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                  Select Quantum Gate Unitary U
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(GATE_UNITARIES) as GateType[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setInspectedGate(g)}
                      className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium border transition-colors ${
                        inspectedGate === g
                          ? isDark
                            ? 'bg-sky-500/20 border-sky-400/50 text-[#38BDF8]'
                            : 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                          : isDark
                          ? 'bg-[#111827] border-white/10 text-slate-300'
                          : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#475569]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unitary Card */}
              <div
                className={`rounded-lg border p-4 space-y-3 ${
                  isDark
                    ? 'bg-[#111827] border-white/[0.07]'
                    : 'bg-[#FAF9F6] border-[#E5E7EB]'
                }`}
              >
                <div className="text-sm font-semibold">{unitaryInfo.name}</div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
                  {unitaryInfo.description}
                </p>
                <div
                  className={`rounded-md border p-3 font-mono text-xs ${
                    isDark
                      ? 'bg-[#090D16] border-white/[0.07] text-[#38BDF8]'
                      : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#0284C7]'
                  }`}
                >
                  {unitaryInfo.latex}
                </div>
                <div className="grid gap-1.5 pt-1">
                  {unitaryInfo.matrix.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2 font-mono text-xs">
                      {row.map((cell, cIdx) => (
                        <div
                          key={cIdx}
                          className={`flex-1 rounded border py-1.5 text-center ${
                            isDark
                              ? 'bg-[#090D16] border-white/[0.06]'
                              : 'bg-[#FFFFFF] border-[#E5E7EB]'
                          }`}
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reduced Single-Qubit Density Matrices */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Reduced Single-Qubit Density Matrices ρ_q = Tr_(&ne;q)(|ψ⟩⟨ψ|)
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
                    Purity Tr(ρ²) = 1.00 indicates a separable pure state; Tr(ρ²) = 0.50 indicates maximal entanglement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reducedMatrices.map((rm) => (
                    <div
                      key={rm.qubit}
                      className={`rounded-lg border p-3.5 space-y-2 ${
                        isDark
                          ? 'bg-[#111827] border-white/[0.07]'
                          : 'bg-[#FAF9F6] border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold">
                          Wire q{rm.qubit}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                            rm.isEntangled
                              ? isDark
                                ? 'bg-purple-500/15 text-[#A855F7]'
                                : 'bg-purple-50 text-[#7C3AED]'
                              : isDark
                              ? 'bg-teal-500/15 text-[#2DD4BF]'
                              : 'bg-teal-50 text-[#0D9488]'
                          }`}
                        >
                          {rm.isEntangled ? 'Entangled' : 'Separable Pure'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                        <div
                          className={`rounded p-1.5 border ${
                            isDark
                              ? 'bg-[#090D16] border-white/[0.05]'
                              : 'bg-[#FFFFFF] border-[#E5E7EB]'
                          }`}
                        >
                          ρ₀₀ = {rm.rho00.re.toFixed(3)}
                        </div>
                        <div
                          className={`rounded p-1.5 border ${
                            isDark
                              ? 'bg-[#090D16] border-white/[0.05]'
                              : 'bg-[#FFFFFF] border-[#E5E7EB]'
                          }`}
                        >
                          ρ₀₁ = {rm.rho01.re.toFixed(2)}
                          {rm.rho01.im >= 0 ? `+${rm.rho01.im.toFixed(2)}i` : `${rm.rho01.im.toFixed(2)}i`}
                        </div>
                        <div
                          className={`rounded p-1.5 border ${
                            isDark
                              ? 'bg-[#090D16] border-white/[0.05]'
                              : 'bg-[#FFFFFF] border-[#E5E7EB]'
                          }`}
                        >
                          ρ₁₀ = {rm.rho10.re.toFixed(2)}
                          {rm.rho10.im >= 0 ? `+${rm.rho10.im.toFixed(2)}i` : `${rm.rho10.im.toFixed(2)}i`}
                        </div>
                        <div
                          className={`rounded p-1.5 border ${
                            isDark
                              ? 'bg-[#090D16] border-white/[0.05]'
                              : 'bg-[#FFFFFF] border-[#E5E7EB]'
                          }`}
                        >
                          ρ₁₁ = {rm.rho11.re.toFixed(3)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 opacity-80">
                        <span>Purity: {rm.purity.toFixed(3)}</span>
                        <span>Entropy S: {rm.entropy.toFixed(2)} bits</span>
                      </div>
                      <div className="text-[11px] font-mono opacity-75">
                        Bloch r = ({rm.bloch.x.toFixed(2)}, {rm.bloch.y.toFixed(2)}, {rm.bloch.z.toFixed(2)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topology' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Physical Coupling Map & ISA Routing
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
                    Compare Heavy-Hex (Heron) vs. Square Lattice (Nighthawk) SWAP overhead.
                  </p>
                </div>

                <div
                  className={`flex rounded-md p-0.5 border ${
                    isDark ? 'bg-[#111827] border-white/10' : 'bg-[#FAF9F6] border-[#E5E7EB]'
                  }`}
                >
                  <button
                    onClick={() => setArch('heron')}
                    className={`rounded px-2.5 py-1 text-xs font-medium ${
                      arch === 'heron'
                        ? isDark
                          ? 'bg-[#1E293B] text-[#38BDF8]'
                          : 'bg-[#FFFFFF] text-[#0284C7] shadow-2xs'
                        : 'opacity-65'
                    }`}
                  >
                    Heron (Heavy-Hex)
                  </button>
                  <button
                    onClick={() => setArch('nighthawk')}
                    className={`rounded px-2.5 py-1 text-xs font-medium ${
                      arch === 'nighthawk'
                        ? isDark
                          ? 'bg-[#1E293B] text-[#38BDF8]'
                          : 'bg-[#FFFFFF] text-[#0284C7] shadow-2xs'
                        : 'opacity-65'
                    }`}
                  >
                    Nighthawk (Grid)
                  </button>
                </div>
              </div>

              {/* Coupling Map SVG */}
              <div
                className={`rounded-lg border p-4 flex flex-col items-center ${
                  isDark ? 'bg-[#111827] border-white/[0.07]' : 'bg-[#FAF9F6] border-[#E5E7EB]'
                }`}
              >
                <svg width="320" height="180" className="overflow-visible">
                  {transpiledReport.activeCouplingEdges.map(([u, v], idx) => {
                    const p1 = nodePositions[u];
                    const p2 = nodePositions[v];
                    if (!p1 || !p2) return null;
                    const isSwapped = transpiledReport.swapEdges.some(
                      ([a, b]) => (a === u && b === v) || (a === v && b === u)
                    );
                    return (
                      <line
                        key={idx}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={
                          isSwapped
                            ? '#D97706'
                            : isDark
                            ? 'rgba(148,163,184,0.3)'
                            : '#CBD5E1'
                        }
                        strokeWidth={isSwapped ? 3 : 2}
                        strokeDasharray={isSwapped ? '4 2' : undefined}
                      />
                    );
                  })}

                  {[0, 1, 2, 3, 4, 5].map((q) => {
                    const pos = nodePositions[q];
                    const active = q < qubitCount;
                    return (
                      <g key={q} transform={`translate(${pos.x}, ${pos.y})`}>
                        <circle
                          r={18}
                          fill={
                            active
                              ? isDark
                                ? '#1E293B'
                                : '#FFFFFF'
                              : isDark
                              ? '#090D16'
                              : '#F1F5F9'
                          }
                          stroke={
                            active
                              ? isDark
                                ? '#38BDF8'
                                : '#0284C7'
                              : isDark
                              ? '#334155'
                              : '#CBD5E1'
                          }
                          strokeWidth={1.75}
                        />
                        <text
                          textAnchor="middle"
                          dy="4"
                          className="font-mono text-xs font-semibold"
                          fill={
                            active
                              ? isDark
                                ? '#F8FAFC'
                                : '#0F172A'
                              : '#64748B'
                          }
                        >
                          Q{q}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="mt-2 flex items-center gap-4 text-[11px] font-mono opacity-75">
                  <span>Inserted SWAPs: {transpiledReport.insertedSwaps}</span>
                  <span>•</span>
                  <span>ISA 2Q Gates: {transpiledReport.isaTwoQubitGates}</span>
                  <span>•</span>
                  <span>Est. Fidelity: {(transpiledReport.estimatedFidelity * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Instruction Decomposition */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  ISA Instruction Decomposition ({transpiledReport.decomposedInstructions.length} ops)
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {transpiledReport.decomposedInstructions.map((inst, i) => (
                    <div
                      key={i}
                      className={`rounded-md border px-3 py-2 text-xs font-mono flex items-center justify-between gap-2 ${
                        isDark
                          ? 'bg-[#111827] border-white/[0.06]'
                          : 'bg-[#FAF9F6] border-[#E5E7EB]'
                      }`}
                    >
                      <span className="font-semibold">{inst.sourceGate}</span>
                      <ArrowRight className="h-3 w-3 opacity-50 shrink-0" />
                      <span className="truncate opacity-80">
                        {inst.isaSequence.join(' → ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
