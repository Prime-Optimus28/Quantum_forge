import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Atom,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  RotateCw,
  Zap,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { LESSONS, MYTH_BUSTERS } from '../../data/curriculumData';

export const CurriculumModule: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<string>('lesson1');

  // Lesson 1 Challenge State: Transform |Phi+> into |Psi->
  const [l1XGate, setL1XGate] = useState<boolean>(false);
  const [l1ZGate, setL1ZGate] = useState<boolean>(false);

  // Lesson 2 Matrix Multiplier Step
  const [l2Step, setL2Step] = useState<number>(0);
  const [l2Angle, setL2Angle] = useState<number>(Math.PI / 4); // Phase wheel angle
  const [l2Pauli, setL2Pauli] = useState<'X' | 'Y' | 'Z'>('Z');

  // Lesson 3 Two Interacting Spins Parameters
  const [couplingJ, setCouplingJ] = useState<number>(1.0);
  const [fieldHx, setFieldHx] = useState<number>(-0.5);
  const [variationalAngle, setVariationalAngle] = useState<number>(0.0); // theta in RY(theta)

  // Lesson 4 Active Hardware Tab
  const [hardwareMetric, setHardwareMetric] = useState<'scale' | 'quality' | 'speed'>('quality');
  const [flippedMyths, setFlippedMyths] = useState<Record<number, boolean>>({});

  // Check Your Understanding reveal toggles
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMyth = (id: number) => {
    setFlippedMyths((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Lesson 1 target verification:
  // |Phi+> = 1/sqrt(2)(|00> + |11>)
  // Applying X on q1 yields 1/sqrt(2)(|10> + |01>)
  // Applying Z on q0 yields 1/sqrt(2)(|01> - |10>) = |Psi->
  const isL1Success = l1XGate && l1ZGate;

  // Lesson 3 Hamiltonian calculations:
  // H = J * Z1 Z0 + hx * (X1 + X0)
  // State prepared with ansatz: |psi(theta)> = RY(theta) applied to |Psi->
  // Exact expectation value calculation
  const expectationEnergy = useMemo(() => {
    // For singlet state |Psi->: <ZZ> = -1, <X1+X0> = 0
    // With variational angle offset theta:
    const zzVal = -Math.cos(variationalAngle * 2);
    const xVal = 2 * Math.sin(variationalAngle);
    const energy = couplingJ * zzVal + fieldHx * xVal;
    return energy;
  }, [couplingJ, fieldHx, variationalAngle]);

  return (
    <div className="flex flex-col gap-6">
      {/* Lesson Navigation Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LESSONS.map((l, idx) => {
          const isActive = activeLessonId === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setActiveLessonId(l.id)}
              className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
                isActive
                  ? 'border-violet-500 bg-violet-950/30 text-white shadow-xl shadow-violet-500/10'
                  : 'border-slate-800 bg-[#111827] text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-violet-400">MODULE 0{idx + 1}</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                  {l.durationMinutes} min
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{l.title}</h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">{l.subtitle}</p>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-400 to-orange-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LESSON 1: BUILD & RUN YOUR FIRST QUANTUM PROGRAM */}
      {/* ------------------------------------------------------------- */}
      {activeLessonId === 'lesson1' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
                <Atom className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Lesson 1 — Build & Run Your First Quantum Program</h2>
                <p className="text-xs text-slate-400">Grounded in IBM Quantum Learning: The Anatomy of a Quantum Circuit</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              In classical computing, a bit is either strictly <strong>0</strong> or <strong>1</strong>. A qubit exists in a linear superposition:
              <span className="font-mono text-cyan-300 mx-1 bg-slate-900 px-2 py-0.5 rounded">|ψ⟩ = α|0⟩ + β|1⟩</span>
              where <span className="font-mono text-cyan-300">|α|² + |β|² = 1</span> according to the Born probability rule.
            </p>

            {/* Interactive Bell State Transformation Challenge */}
            <div className="rounded-xl border border-cyan-800/60 bg-[#0B0F19] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Interactive Bell State Transformation Challenge
                </span>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
                  Target: |Ψ⁻⟩ = 1/√2 (|01⟩ - |10⟩)
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Starting from the standard Bell state <span className="font-mono text-white">|Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩)</span> (created with H(0) and CX(0, 1)), which single-qubit gates must you apply to transform it into the anti-correlated singlet state <span className="font-mono text-cyan-300">|Ψ⁻⟩ = 1/√2 (|01⟩ - |10⟩)</span>?
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setL1XGate(!l1XGate)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition ${
                    l1XGate
                      ? 'bg-cyan-600 text-white ring-2 ring-cyan-400 shadow-md'
                      : 'border border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Gate: Pauli-X on q1</span>
                  {l1XGate && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>

                <button
                  onClick={() => setL1ZGate(!l1ZGate)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition ${
                    l1ZGate
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md'
                      : 'border border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Gate: Pauli-Z on q0</span>
                  {l1ZGate && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Real-time State Evolution Preview */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Resulting Superposition:</span>
                <span className={`font-bold ${isL1Success ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {!l1XGate && !l1ZGate && '1/√2 (|00⟩ + |11⟩)  [|Φ⁺⟩]'}
                  {l1XGate && !l1ZGate && '1/√2 (|01⟩ + |10⟩)  [|Ψ⁺⟩: X on q1 flipped state]'}
                  {!l1XGate && l1ZGate && '1/√2 (|00⟩ - |11⟩)  [|Φ⁻⟩: Z on q0 inverted phase]'}
                  {l1XGate && l1ZGate && '1/√2 (|01⟩ - |10⟩)  [|Ψ⁻⟩ Singlet State Verified!]'}
                </span>
              </div>

              {isL1Success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-950/40 border border-emerald-500/50 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Challenge Complete!</strong> Applying Pauli-X to q1 interchanges the basis bits to |01⟩ and |10⟩, and applying Pauli-Z to q0 introduces the negative relative phase on the |10⟩ component in Qiskit’s little-endian ordering!
                  </span>
                </div>
              )}
            </div>

            {/* Check Your Understanding Reveal Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-violet-400 font-bold flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Check Your Understanding: Born Rule Shot Statistics
                </span>
                <button
                  onClick={() => toggleReveal('c1')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {revealedCards['c1'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{revealedCards['c1'] ? 'Hide Answer' : 'Reveal Explanation'}</span>
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-300">
                If you sample 1,000 shots on an ideal quantum simulator from |Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩), why will you virtually never get exactly 500 counts of 00 and 500 counts of 11?
              </p>

              {revealedCards['c1'] && (
                <div className="mt-3 rounded-lg border border-slate-800 bg-[#0B0F19] p-3 text-xs text-slate-300 leading-relaxed font-mono">
                  Born’s rule gives the theoretical probability P = 0.5. Sampling 1,000 shots is equivalent to flipping an unbiased coin 1,000 times—governed by the binomial distribution with standard deviation σ = √(N · p · (1 - p)) = √(1000 · 0.25) ≈ 15.8 shots. Therefore, observing 504 counts of 00 and 496 counts of 11 is completely standard physical shot noise!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LESSON 2: QUANTUM MECHANICS BASICS */}
      {/* ------------------------------------------------------------- */}
      {activeLessonId === 'lesson2' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Lesson 2 — Quantum Mechanics Basics</h2>
                <p className="text-xs text-slate-400">Matrix-Vector Multiplication, Phase Wheels & Pauli Observables</p>
              </div>
            </div>

            {/* Matrix Vector Multiplier Interactive Stepper */}
            <div className="rounded-xl border border-violet-800/50 bg-[#0B0F19] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                  Interactive Matrix-Vector State Evolution Stepper
                </span>
                <div className="flex gap-1.5">
                  {['Step 0: |00⟩', 'Step 1: H₀|00⟩', 'Step 2: CNOT → |Φ⁺⟩'].map((name, s) => (
                    <button
                      key={s}
                      onClick={() => setL2Step(s)}
                      className={`rounded px-2.5 py-1 text-xs font-mono transition ${
                        l2Step === s
                          ? 'bg-violet-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Visualization */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
                {l2Step === 0 && (
                  <div className="space-y-2">
                    <div className="text-slate-400">Initial Statevector (Ground State):</div>
                    <div className="text-cyan-400 text-sm font-bold">|ψ₀⟩ = [1, 0, 0, 0]ᵀ = |00⟩</div>
                    <p className="text-slate-400 text-[11px]">
                      Both qubits q0 and q1 start in the |0⟩ basis state with probability 1.0.
                    </p>
                  </div>
                )}
                {l2Step === 1 && (
                  <div className="space-y-2">
                    <div className="text-slate-400">Tensor Expansion H₀ = H ⊗ I applied to |00⟩:</div>
                    <div className="text-violet-400 text-sm font-bold">
                      H₀|00⟩ = 1/√2 [1, 1, 0, 0]ᵀ = 1/√2 (|00⟩ + |01⟩)
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Hadamard on q0 places qubit 0 in equal superposition (|0⟩ + |1⟩)/√2 while leaving q1 untouched in |0⟩.
                    </p>
                  </div>
                )}
                {l2Step === 2 && (
                  <div className="space-y-2">
                    <div className="text-slate-400">CNOT Gate Permutation applied to 1/√2 (|00⟩ + |01⟩):</div>
                    <div className="text-emerald-400 text-sm font-bold">
                      CNOT · H₀|00⟩ = 1/√2 [1, 0, 0, 1]ᵀ = 1/√2 (|00⟩ + |11⟩)
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Because q0 controls q1, the component where q0=1 flips q1 from 0 to 1, creating maximal 2-qubit entanglement!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Complex-Plane Phase Wheel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold">COMPLEX PHASE WHEEL (e^{'{iθ}'})</span>
                  <span className="text-cyan-400">θ = {(l2Angle / Math.PI).toFixed(2)}π</span>
                </div>

                <div className="flex items-center justify-center py-4">
                  <div className="relative h-36 w-36 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center">
                    {/* Axes */}
                    <div className="absolute inset-x-0 h-px bg-slate-800" />
                    <div className="absolute inset-y-0 w-px bg-slate-800" />

                    {/* Vector pointer */}
                    <div
                      className="absolute h-0.5 w-16 bg-gradient-to-r from-transparent to-cyan-400 origin-left"
                      style={{
                        transform: `rotate(${-l2Angle}rad)`,
                      }}
                    />
                    <div
                      className="absolute h-3 w-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400"
                      style={{
                        left: `calc(50% + ${Math.cos(l2Angle) * 56}px - 6px)`,
                        top: `calc(50% - ${Math.sin(l2Angle) * 56}px - 6px)`,
                      }}
                    />
                    <span className="text-[10px] font-mono text-slate-500 absolute top-1">Im</span>
                    <span className="text-[10px] font-mono text-slate-500 absolute right-1">Re</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max={2 * Math.PI}
                  step="0.05"
                  value={l2Angle}
                  onChange={(e) => setL2Angle(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />

                <div className="text-[11px] font-mono text-slate-400 text-center">
                  cos(θ) = {Math.cos(l2Angle).toFixed(3)}, sin(θ) = {Math.sin(l2Angle).toFixed(3)}
                </div>
              </div>

              {/* Pauli Observable Explorer */}
              <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold">PAULI OBSERVABLES & EIGENVALUES</span>
                  <div className="flex gap-1">
                    {(['X', 'Y', 'Z'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setL2Pauli(p)}
                        className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${
                          l2Pauli === p ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-xs space-y-2">
                  <div className="text-cyan-300 font-bold">Pauli-{l2Pauli} Operator:</div>
                  <div className="text-slate-300">
                    {l2Pauli === 'Z' && 'Z = [[1, 0], [0, -1]]'}
                    {l2Pauli === 'X' && 'X = [[0, 1], [1, 0]]'}
                    {l2Pauli === 'Y' && 'Y = [[0, -i], [i, 0]]'}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Eigenstates:
                    {l2Pauli === 'Z' && ' |0⟩ (+1) and |1⟩ (-1)'}
                    {l2Pauli === 'X' && ' |+⟩ = (|0⟩+|1⟩)/√2 (+1) and |-⟩ = (|0⟩-|1⟩)/√2 (-1)'}
                    {l2Pauli === 'Y' && ' |i⟩ = (|0⟩+i|1⟩)/√2 (+1) and |-i⟩ = (|0⟩-i|1⟩)/√2 (-1)'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pauli operators are both <strong>unitary gates</strong> (generating rotations) and <strong>Hermitian observables</strong> (yielding physical measurement values of ±1).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LESSON 3: YOUR FIRST QUANTUM EXPERIMENT (TWO INTERACTING SPINS) */}
      {/* ------------------------------------------------------------- */}
      {activeLessonId === 'lesson3' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Lesson 3 — Your First Quantum Experiment: Two Interacting Spins</h2>
                <p className="text-xs text-slate-400">
                  Antiferromagnetic Model H = J Z₁Z₀ + hₓ(X₁ + X₀) and the 4-Step Qiskit Patterns Workflow
                </p>
              </div>
            </div>

            {/* 4-Step Qiskit Patterns Workflow */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {[
                { step: '1. Map', desc: 'Hamiltonian to SparsePauliOp & state ansatz' },
                { step: '2. Optimize', desc: 'PassManager transpiles to Heron ISA' },
                { step: '3. Execute', desc: 'Run on SamplerV2 and EstimatorV2' },
                { step: '4. Post-Process', desc: 'Mitigate errors & compute ground state' },
              ].map((p, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-[#0B0F19] p-3 text-xs">
                  <div className="font-mono font-bold text-cyan-400 mb-1">{p.step}</div>
                  <div className="text-slate-400 text-[11px]">{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Interactive Physics Experiment Sliders */}
            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  HAMILTONIAN TUNING: H = J · Z₁Z₀ + hₓ · (X₁ + X₀)
                </span>
                <span className="text-xs font-mono text-cyan-400">Two Coupled Magnetic Spins</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Coupling J (Antiferromagnetic):</span>
                    <span className="text-white font-bold">{couplingJ.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={couplingJ}
                    onChange={(e) => setCouplingJ(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Transverse Field hₓ:</span>
                    <span className="text-white font-bold">{fieldHx.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="0"
                    step="0.1"
                    value={fieldHx}
                    onChange={(e) => setFieldHx(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Variational Ansatz θ:</span>
                    <span className="text-violet-400 font-bold">{(variationalAngle / Math.PI).toFixed(2)}π</span>
                  </div>
                  <input
                    type="range"
                    min="-1.57"
                    max="1.57"
                    step="0.05"
                    value={variationalAngle}
                    onChange={(e) => setVariationalAngle(parseFloat(e.target.value))}
                    className="w-full accent-violet-400"
                  />
                </div>
              </div>

              {/* Sampler vs Estimator Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Sampler Box */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300">QISKIT SAMPLER (BITSTRINGS)</span>
                    <span className="text-slate-500">Antiferromagnetic Order</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Because J &gt; 0, antiparallel spin states |01⟩ and |10⟩ dominate measurement counts:
                  </p>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">|01⟩ + |10⟩ (Antiparallel):</span>
                      <span className="text-emerald-400 font-bold">~98.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">|00⟩ + |11⟩ (Parallel):</span>
                      <span className="text-slate-500">~1.6%</span>
                    </div>
                  </div>
                </div>

                {/* Estimator Box */}
                <div className="rounded-xl border border-violet-800/60 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-violet-300">QISKIT ESTIMATOR (⟨ψ|H|ψ⟩)</span>
                    <span className="text-emerald-400 font-bold">Expectation Value</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white py-1">
                    ⟨E⟩ = {expectationEnergy.toFixed(4)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Estimator directly evaluates Pauli expectation sums without requiring exhaustive bitstring sampling!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LESSON 4: QUANTUM COMPUTING CONTEXT & HARDWARE METRICS */}
      {/* ------------------------------------------------------------- */}
      {activeLessonId === 'lesson4' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Lesson 4 — Quantum Computing Context & Hardware Metrics</h2>
                <p className="text-xs text-slate-400">
                  Scale, Quality, Speed, Myth-Busting & Fault-Tolerant Architectures
                </p>
              </div>
            </div>

            {/* 6 Core Myth-Buster Cards */}
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                6 Core Misconceptions in Quantum Computing (Click to Flip & Reveal Reality):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MYTH_BUSTERS.map((m) => {
                  const isFlipped = flippedMyths[m.id];
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMyth(m.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                        isFlipped
                          ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                          : 'border-slate-800 bg-[#0B0F19] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className={isFlipped ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {isFlipped ? '✓ SCIENTIFIC REALITY' : '✗ COMMON MYTH'}
                        </span>
                        <span className="text-[10px] text-slate-500">#{m.id}</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed">
                        {isFlipped ? m.reality : `"${m.myth}"`}
                      </p>
                      {isFlipped && (
                        <p className="mt-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                          {m.scientificContext}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scale vs Quality vs Speed 3D Benchmark Explorer */}
            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  THE TRIAD OF QUANTUM PERFORMANCE: SCALE, QUALITY, AND SPEED
                </span>
                <div className="flex gap-1.5">
                  {(['scale', 'quality', 'speed'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setHardwareMetric(m)}
                      className={`rounded px-2.5 py-1 text-xs font-mono capitalize transition ${
                        hardwareMetric === m
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs space-y-3 font-mono">
                {hardwareMetric === 'scale' && (
                  <div>
                    <h4 className="text-cyan-400 font-bold text-sm mb-1">Scale: Programmable Physical & Logical Qubits</h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Scale represents how large a Hilbert space the processor can instantiate. While older processors focused on raw qubit count (e.g. Eagle with 127 qubits or Condor with 1,121 qubits), modern IBM Heron (156 qubits) and Nighthawk prioritize heavy-hex routing and lower crosstalk for surface code fault tolerance.
                    </p>
                  </div>
                )}
                {hardwareMetric === 'quality' && (
                  <div>
                    <h4 className="text-violet-400 font-bold text-sm mb-1">Quality: Quantum Operations (QuOps) & EPLG</h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Quality measures how many gates can run before decoherence corrupts the state. Measured via Error Per Layered Gate (EPLG) and T1/T2 relaxation times. IBM Heron achieves EPLG of ~1.8 × 10⁻³, a 5× improvement over previous generation transmons.
                    </p>
                  </div>
                )}
                {hardwareMetric === 'speed' && (
                  <div>
                    <h4 className="text-emerald-400 font-bold text-sm mb-1">Speed: Circuit Layer Operations Per Second (CLOPS)</h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      CLOPS measures real-world circuit execution throughput, including classical-quantum control latency, readout integration, and batch queue turnaround. High CLOPS (10,000+ CLOPS) is vital for hybrid variational algorithms (VQE, QAOA) requiring thousands of iterative updates.
                    </p>
                  </div>
                )}
              </div>

              {/* Error Mitigation vs Error Correction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="font-mono text-xs font-bold text-cyan-300">ERROR MITIGATION (NISQ TODAY)</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Uses classical algorithmic techniques (Zero-Noise Extrapolation, Readout Matrix Inversion) without physical qubit expansion to estimate noise-free expectation values on near-term hardware.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="font-mono text-xs font-bold text-violet-300">ERROR CORRECTION (FAULT TOLERANT)</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Entangles hundreds to thousands of physical qubits into topological surface codes to continuously detect and correct bit-flips and phase-flips in real time without collapsing the encoded logical qubit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
