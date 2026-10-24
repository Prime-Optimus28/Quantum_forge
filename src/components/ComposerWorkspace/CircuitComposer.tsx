import React, { useState, useMemo } from 'react';
import {
  Play,
  Trash2,
  Copy,
  Check,
  Sliders,
  AlertTriangle,
  Activity,
  Code,
  Compass,
  Wand2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { GatePlacement, GateType, StatevectorEntry, SimulationResult } from '../../types/quantum';
import {
  simulateStatevector,
  formatDiracNotation,
  runSimulation,
  generateQiskitCode,
  PRESET_CIRCUITS,
  complex,
  computeReducedDensityMatrices,
  analyzeAncillaCorruption,
  generateMirrorUncomputationGates,
  transpileCircuitToHardware,
} from '../../utils/quantumEngine';
import { UnitaryInspectorModal } from './UnitaryInspectorModal';
import { HardwareTranspilerModal } from './HardwareTranspilerModal';

interface CircuitComposerProps {
  qubitCount: number;
  setQubitCount: (n: number) => void;
  gates: GatePlacement[];
  setGates: React.Dispatch<React.SetStateAction<GatePlacement[]>>;
  statevector: StatevectorEntry[];
}

export const CircuitComposer: React.FC<CircuitComposerProps> = ({
  qubitCount,
  setQubitCount,
  gates,
  setGates,
}) => {
  // Simulator configurations
  const [shots, setShots] = useState<number>(1000);
  const [selectedBackend, setSelectedBackend] = useState<string>('ideal');
  const [simResult, setSimResult] = useState<SimulationResult | null>(() =>
    runSimulation(qubitCount, gates, 1000, 'ideal')
  );
  // Timeline scrubber: -1 = initial state |0...0>, 0..9 = after step t, 99 = final state
  const [activeStepScrub, setActiveStepScrub] = useState<number>(99);
  const [selectedGateForInspect, setSelectedGateForInspect] = useState<GatePlacement | null>(null);
  const [isTranspilerOpen, setIsTranspilerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'math' | 'density' | 'shots' | 'transpiler' | 'qiskit'>('math');
  const [measurementBasis, setMeasurementBasis] = useState<'Z' | 'X' | 'Y'>('Z');
  const [transpilerArch, setTranspilerArch] = useState<'heron' | 'nighthawk'>('heron');

  // Currently selected gate from palette for click-to-place
  const [paletteGate, setPaletteGate] = useState<GateType>('H');
  const [rotationAngle, setRotationAngle] = useState<number>(Math.PI / 2);
  const [targetWire, setTargetWire] = useState<number>(1);
  const [secondControlWire, setSecondControlWire] = useState<number>(1);

  // Mark specific wire as Ancilla / Scratch qubit
  const [ancillaWires, setAncillaWires] = useState<Record<number, boolean>>({
    2: true,
  });

  const MAX_STEPS = 10;

  // Stage 1: Real-time intermediate statevector based on timeline scrubber
  const currentScrubStatevector = useMemo(() => {
    return simulateStatevector(qubitCount, gates, activeStepScrub);
  }, [qubitCount, gates, activeStepScrub]);

  const diracRepresentation = useMemo(() => {
    return formatDiracNotation(currentScrubStatevector);
  }, [currentScrubStatevector]);

  // Stage 1: Reduced Single-Qubit Density Matrices rho_q = Tr_{!=q}(|psi><psi|)
  const reducedDensityMatrices = useMemo(() => {
    return computeReducedDensityMatrices(qubitCount, currentScrubStatevector);
  }, [qubitCount, currentScrubStatevector]);

  // Stage 2: Interactive Ancilla Entanglement & Interference Corruption Analysis
  const ancillaCorruptionReports = useMemo(() => {
    return analyzeAncillaCorruption(
      qubitCount,
      gates,
      ancillaWires,
      currentScrubStatevector,
      reducedDensityMatrices
    );
  }, [qubitCount, gates, ancillaWires, currentScrubStatevector, reducedDensityMatrices]);

  // Stage 4: Live Hardware Transpiler Report
  const transpilerReport = useMemo(() => {
    return transpileCircuitToHardware(qubitCount, gates, transpilerArch, 3);
  }, [qubitCount, gates, transpilerArch]);

  // Execute simulation
  const handleRunSimulation = () => {
    const result = runSimulation(qubitCount, gates, shots, selectedBackend);
    setSimResult(result);
  };

  // Add or remove Gate
  const handleCellClick = (q: number, step: number) => {
    const existingIdx = gates.findIndex((g) => g.qubit === q && g.step === step);
    if (existingIdx !== -1) {
      setGates(gates.filter((_, idx) => idx !== existingIdx));
      return;
    }

    let tgt = targetWire;
    if (tgt === q || tgt >= qubitCount) tgt = (q + 1) % qubitCount;
    let c2 = secondControlWire;
    if (c2 === q || c2 === tgt || c2 >= qubitCount) c2 = (q + 2) % qubitCount;

    const newGate: GatePlacement = {
      id: `${Date.now()}_${Math.random()}`,
      type: paletteGate,
      qubit: q,
      step,
      target:
        paletteGate === 'CX' || paletteGate === 'CZ' || paletteGate === 'SWAP' || paletteGate === 'CCX'
          ? tgt
          : undefined,
      control:
        paletteGate === 'CX' || paletteGate === 'CZ' || paletteGate === 'CCX' ? q : undefined,
      control2: paletteGate === 'CCX' ? c2 : undefined,
      angle: paletteGate.startsWith('R') ? rotationAngle : undefined,
      basis: paletteGate === 'M' ? measurementBasis : undefined,
    };

    setGates((prev) => [...prev, newGate]);
  };

  const handleSetQubitCount = (n: number) => {
    setQubitCount(n);
    setGates((prev) =>
      prev.filter(
        (g) =>
          g.qubit < n &&
          (g.target === undefined || g.target < n) &&
          (g.control === undefined || g.control < n) &&
          (g.control2 === undefined || g.control2 < n)
      )
    );
  };

  const handleClearCircuit = () => {
    setGates([]);
    setActiveStepScrub(99);
  };

  const loadPreset = (presetId: string) => {
    const preset = PRESET_CIRCUITS.find((p) => p.id === presetId);
    if (preset) {
      setQubitCount(preset.qubitCount);
      setGates(preset.gates);
      setActiveStepScrub(99);
      if (presetId === 'uncomputation_demo' || presetId === 'corrupted_ancilla_demo') {
        setAncillaWires({ 2: true });
      }
    }
  };

  const handleAutoUncompute = () => {
    const fixedGates = generateMirrorUncomputationGates(gates, ancillaWires);
    setGates(fixedGates);
    setActiveStepScrub(99);
  };

  const qiskitCode = useMemo(() => {
    return generateQiskitCode(qubitCount, gates, shots, selectedBackend);
  }, [qubitCount, gates, shots, selectedBackend]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qiskitCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const singleQubitGates: { type: GateType; label: string; badge: string; color: string }[] = [
    { type: 'H', label: 'Hadamard', badge: 'H', color: 'bg-rose-500 hover:bg-rose-600 text-white' },
    { type: 'X', label: 'Pauli-X (NOT)', badge: 'X', color: 'bg-cyan-600 hover:bg-cyan-500 text-white' },
    { type: 'Y', label: 'Pauli-Y', badge: 'Y', color: 'bg-teal-600 hover:bg-teal-500 text-white' },
    { type: 'Z', label: 'Pauli-Z', badge: 'Z', color: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
    { type: 'S', label: 'Phase (π/2)', badge: 'S', color: 'bg-amber-600 hover:bg-amber-500 text-white' },
    { type: 'T', label: 'T-Gate (π/4)', badge: 'T', color: 'bg-orange-600 hover:bg-orange-500 text-white' },
    { type: 'RX', label: 'RX(θ)', badge: 'RX', color: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
    { type: 'RY', label: 'RY(θ)', badge: 'RY', color: 'bg-blue-600 hover:bg-blue-500 text-white' },
    { type: 'RZ', label: 'RZ(θ)', badge: 'RZ', color: 'bg-purple-600 hover:bg-purple-500 text-white' },
    {
      type: 'M',
      label: 'Measure',
      badge: 'M',
      color: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500',
    },
  ];

  const multiQubitGates: {
    type: GateType;
    label: string;
    badge: string;
    color: string;
    isHighCost?: boolean;
  }[] = [
    { type: 'CX', label: 'CNOT / CX', badge: 'CX', color: 'bg-violet-600 hover:bg-violet-500 text-white' },
    { type: 'CZ', label: 'Controlled-Z', badge: 'CZ', color: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' },
    { type: 'SWAP', label: 'SWAP', badge: 'SWAP', color: 'bg-sky-600 hover:bg-sky-500 text-white' },
    {
      type: 'CCX',
      label: 'Toffoli (CCX)',
      badge: 'CCX',
      color: 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md',
      isHighCost: true,
    },
  ];

  const sliderScrubValue = activeStepScrub >= 90 ? MAX_STEPS : activeStepScrub;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Wire Count Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs">
            <span className="font-mono text-slate-400">Qubit Wires:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => handleSetQubitCount(n)}
                  className={`h-6 w-6 rounded text-xs font-mono font-bold transition ${
                    qubitCount === n
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Circuits */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CIRCUITS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p.id)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    p.id === 'corrupted_ancilla_demo'
                      ? 'border-amber-600/60 bg-amber-950/30 text-amber-300 hover:border-amber-400'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500 hover:text-cyan-300'
                  }`}
                  title={p.description}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTranspilerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/50 transition"
            title="Inspect Native Hardware Transpilation & Heavy-Hex Topology"
          >
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span>Hardware Transpiler View</span>
          </button>

          <button
            onClick={handleClearCircuit}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-400 hover:border-rose-500/50 hover:text-rose-400 transition"
            title="Clear all gates from canvas"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Gate Palette Selector */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Gate Palette (Select gate, then click wire slot):
            </span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs font-mono text-cyan-300 font-bold border border-cyan-800">
              Active: {paletteGate}
            </span>
          </div>

          {paletteGate.startsWith('R') && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-mono text-slate-300">θ = {(rotationAngle / Math.PI).toFixed(2)}π</span>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.05"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400"
              />
            </div>
          )}

          {paletteGate === 'M' && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs">
              <span className="font-mono text-slate-400">Basis:</span>
              {(['Z', 'X', 'Y'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setMeasurementBasis(b)}
                  className={`rounded px-2 py-0.5 font-mono text-xs ${
                    measurementBasis === b
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b}-basis
                </button>
              ))}
            </div>
          )}

          {(paletteGate === 'CX' ||
            paletteGate === 'CZ' ||
            paletteGate === 'SWAP' ||
            paletteGate === 'CCX') && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs">
              <span className="font-mono text-slate-400">Target Qubit:</span>
              <select
                value={targetWire}
                onChange={(e) => setTargetWire(parseInt(e.target.value))}
                className="rounded bg-slate-800 px-2 py-0.5 font-mono text-cyan-300 focus:outline-none"
              >
                {Array.from({ length: qubitCount }).map((_, idx) => (
                  <option key={idx} value={idx}>
                    q{idx}
                  </option>
                ))}
              </select>

              {paletteGate === 'CCX' && (
                <>
                  <span className="font-mono text-slate-400">2nd Control:</span>
                  <select
                    value={secondControlWire}
                    onChange={(e) => setSecondControlWire(parseInt(e.target.value))}
                    className="rounded bg-slate-800 px-2 py-0.5 font-mono text-amber-300 focus:outline-none"
                  >
                    {Array.from({ length: qubitCount }).map((_, idx) => (
                      <option key={idx} value={idx}>
                        q{idx}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}
        </div>

        {/* Gate Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5 border-r border-slate-800 pr-3">
            {singleQubitGates.map((g) => (
              <button
                key={g.type}
                onClick={() => setPaletteGate(g.type)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold transition shadow-sm ${
                  paletteGate === g.type
                    ? 'ring-2 ring-cyan-400 scale-105 ' + g.color
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
                title={g.label}
              >
                <span>{g.badge}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {multiQubitGates.map((g) => (
              <button
                key={g.type}
                onClick={() => setPaletteGate(g.type)}
                className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold transition shadow-sm ${
                  paletteGate === g.type
                    ? 'ring-2 ring-violet-400 scale-105 ' + g.color
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
                title={g.label}
              >
                <span>{g.badge}</span>
                {g.isHighCost && (
                  <span className="rounded bg-rose-950/80 px-1 text-[9px] text-rose-300 border border-rose-800">
                    High Cost
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Circuit Canvas + Vertical Timeline Scrubber */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#0B0F19] p-6 shadow-2xl overflow-x-auto">
        {/* Interactive Timeline Scrubber Control Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <Compass className="h-4 w-4 text-cyan-400" />
            <span>Timeline State Scrubber:</span>
            <input
              type="range"
              min={-1}
              max={MAX_STEPS}
              step={1}
              value={sliderScrubValue}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setActiveStepScrub(v >= MAX_STEPS ? 99 : v);
              }}
              className="w-36 sm:w-48 accent-cyan-400 cursor-pointer"
            />
            <span className="rounded bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 text-cyan-300 font-bold">
              {activeStepScrub === -1
                ? 'Init |0...0⟩'
                : activeStepScrub >= 90
                ? 'Final Step (All Gates)'
                : `After Step t${activeStepScrub}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveStepScrub(-1)}
              className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 hover:text-white"
            >
              |0⟩ Init
            </button>
            <button
              onClick={() =>
                setActiveStepScrub((prev) =>
                  prev >= 90 ? 0 : prev + 1 >= MAX_STEPS ? 99 : prev + 1
                )
              }
              className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300 hover:bg-cyan-900"
            >
              Step +1 →
            </button>
            <button
              onClick={() => setActiveStepScrub(99)}
              className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 hover:text-white"
            >
              Final State
            </button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="min-w-[700px]">
          {/* Column Step Headers */}
          <div className="flex items-center pl-28 pr-4 pb-2 border-b border-slate-900 text-slate-500 font-mono text-[11px]">
            {Array.from({ length: MAX_STEPS }).map((_, step) => (
              <div
                key={step}
                onClick={() => setActiveStepScrub(step)}
                className={`flex-1 text-center cursor-pointer transition-colors py-0.5 rounded ${
                  activeStepScrub === step
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'hover:text-slate-300'
                }`}
              >
                t{step}
              </div>
            ))}
          </div>

          {/* Qubit Wires */}
          <div className="space-y-4 py-4 relative">
            {/* Timeline Scrub Vertical Line */}
            {activeStepScrub >= 0 && activeStepScrub < MAX_STEPS && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-violet-400 to-orange-400 pointer-events-none z-20 shadow-lg shadow-cyan-400/50"
                style={{
                  left: `calc(7rem + ${(activeStepScrub + 0.5) * (100 / MAX_STEPS)}% - ${7 / MAX_STEPS}rem)`,
                }}
              />
            )}

            {Array.from({ length: qubitCount }).map((_, q) => {
              const isAncilla = ancillaWires[q] || false;
              const rdm = reducedDensityMatrices[q];
              const isDirtyAncilla =
                isAncilla && rdm && (rdm.purity < 0.992 || rdm.probOne > 0.01);

              return (
                <div key={q} className="group relative flex items-center">
                  {/* Wire Label & Ancilla Toggle */}
                  <div className="w-28 shrink-0 flex items-center justify-between pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-bold text-cyan-300">q_{q}</span>
                      <span className="font-mono text-xs text-slate-500">|0⟩</span>
                    </div>
                    <button
                      onClick={() =>
                        setAncillaWires((prev) => ({
                          ...prev,
                          [q]: !prev[q],
                        }))
                      }
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold transition ${
                        isDirtyAncilla
                          ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                          : isAncilla
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                      }`}
                      title="Click to toggle wire between Work Register and Scratch Ancilla Qubit"
                    >
                      {isDirtyAncilla ? '⚠️ Dirty' : isAncilla ? 'Ancilla' : 'Work'}
                    </button>
                  </div>

                  {/* Horizontal Wire Line */}
                  <div className="relative flex-1 flex items-center h-12">
                    <div
                      className={`absolute inset-x-0 h-0.5 transition-colors ${
                        isDirtyAncilla
                          ? 'bg-rose-500/60'
                          : isAncilla
                          ? 'bg-amber-500/40'
                          : 'bg-slate-700/80 group-hover:bg-cyan-900/60'
                      }`}
                    />

                    {/* Step Slots */}
                    <div className="relative z-10 grid w-full grid-cols-10 gap-2 px-2">
                      {Array.from({ length: MAX_STEPS }).map((_, step) => {
                        const gate = gates.find((g) => g.qubit === q && g.step === step);
                        const multiSource = gates.find(
                          (g) => (g.target === q || g.control2 === q) && g.step === step
                        );
                        const isDimmedByScrub =
                          activeStepScrub >= -1 && activeStepScrub < 90 && step > activeStepScrub;

                        return (
                          <div
                            key={step}
                            onClick={() => handleCellClick(q, step)}
                            className={`flex h-11 items-center justify-center rounded-lg border border-transparent hover:border-cyan-500/50 hover:bg-cyan-950/20 cursor-pointer transition relative ${
                              isDimmedByScrub ? 'opacity-30' : 'opacity-100'
                            }`}
                          >
                            {gate ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGateForInspect(gate);
                                }}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-md transition-transform hover:scale-110 active:scale-95 ${
                                  gate.type === 'H'
                                    ? 'bg-rose-500 text-white'
                                    : gate.type === 'CCX'
                                    ? 'bg-gradient-to-br from-amber-500 to-rose-600 text-white'
                                    : gate.type === 'CX' || gate.type === 'CZ'
                                    ? 'bg-violet-600 text-white'
                                    : gate.type === 'M'
                                    ? 'bg-slate-800 text-cyan-300 border border-slate-600'
                                    : 'bg-cyan-600 text-white'
                                }`}
                                title={`${gate.type} Gate at q${q}, t${step} (Click to inspect unitary matrix)`}
                              >
                                {gate.type === 'CX' ? '•' : gate.type}
                                {gate.angle !== undefined && (
                                  <span className="absolute -bottom-1 -right-1 text-[8px] bg-slate-900 px-0.5 rounded text-cyan-300">
                                    θ
                                  </span>
                                )}
                              </div>
                            ) : multiSource ? (
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold border-2 ${
                                  multiSource.type === 'CX'
                                    ? 'border-violet-400 bg-violet-950 text-violet-300'
                                    : multiSource.type === 'CCX'
                                    ? 'border-amber-400 bg-amber-950 text-amber-300'
                                    : 'border-cyan-400 bg-cyan-950 text-cyan-300'
                                }`}
                              >
                                {multiSource.type === 'CX'
                                  ? '⊕'
                                  : multiSource.type === 'CCX'
                                  ? multiSource.target === q
                                    ? '⊕'
                                    : '•'
                                  : 'Z'}
                              </div>
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-slate-800 opacity-0 hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Classical Register (Double Line) */}
            <div className="flex items-center pt-2 border-t border-slate-800/80">
              <div className="w-28 shrink-0 font-mono text-xs font-bold text-slate-500 pr-3">
                meas [/{qubitCount}]
              </div>
              <div className="relative flex-1 flex flex-col justify-center h-6">
                <div className="h-0.5 bg-slate-600 w-full mb-0.5" />
                <div className="h-0.5 bg-slate-600 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 2: INTERACTIVE UNCOMPUTATION DEBUGGER & INTERFERENCE CORRUPTION PANEL */}
        {ancillaCorruptionReports.length > 0 && (
          <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-950/25 p-4 space-y-3">
            {ancillaCorruptionReports.map((rep) => (
              <div key={rep.qubit} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>
                      ANCILLA ENTANGLEMENT WARNING (Wire q_{rep.qubit} | Purity Tr(ρ²) = {rep.purity.toFixed(3)} | P(|1⟩) ={' '}
                      {(rep.probOne * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <button
                    onClick={handleAutoUncompute}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-mono font-bold text-white shadow-md hover:bg-emerald-500 transition"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Auto-Append Mirror Uncomputation (U†)</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rep.explanation}</p>

                {/* Side-by-Side Interference Corruption Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="rounded-lg border border-rose-800/60 bg-slate-950/90 p-3">
                    <div className="text-rose-400 font-bold mb-1.5">
                      ✗ Corrupted Work Register (Ancilla q_{rep.qubit} Discarded / Traced Out)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(rep.corruptedOutputProbs).map(([bits, prob]) => (
                        <span
                          key={bits}
                          className="rounded bg-rose-950/50 border border-rose-800/50 px-2 py-0.5 text-[11px] text-rose-200"
                        >
                          |{bits}⟩: {(prob * 100).toFixed(1)}%
                        </span>
                      ))}
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-400 font-sans">
                      Off-diagonal phase interference collapses into an incoherent classical mixture.
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-800/60 bg-slate-950/90 p-3">
                    <div className="text-emerald-400 font-bold mb-1.5">
                      ✓ Coherent Target Register (If Ancilla q_{rep.qubit} Uncomputed to |0⟩)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(rep.coherentOutputProbs).map(([bits, prob]) => (
                        <span
                          key={bits}
                          className="rounded bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 text-[11px] text-emerald-200"
                        >
                          |{bits}⟩: {(prob * 100).toFixed(1)}%
                        </span>
                      ))}
                    </div>
                    <div className="mt-1.5 text-[10px] text-slate-400 font-sans">
                      Constructive and destructive quantum interference preserved across work wires.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Tabs: Statevector / Reduced Density Matrix / Shots / Transpiler / Qiskit Code */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl">
        <div className="flex border-b border-slate-800 pb-3 justify-between items-center flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('math')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'math'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Exact 2ⁿ Complex Statevector</span>
            </button>

            <button
              onClick={() => setActiveTab('density')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'density'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Reduced Density Matrices (ρ_q)</span>
            </button>

            <button
              onClick={() => setActiveTab('shots')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'shots'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Shots & Noisy QPU</span>
            </button>

            <button
              onClick={() => setActiveTab('transpiler')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'transpiler'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Hardware Transpiler & Topology</span>
            </button>

            <button
              onClick={() => setActiveTab('qiskit')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === 'qiskit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Live Qiskit v2 Code</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Convention: <span className="text-cyan-400 font-bold">Little-Endian</span> (Rightmost bit = q0)
          </div>
        </div>

        {/* Tab 1: Exact 2^n Complex Statevector & Phase Wheel View */}
        {activeTab === 'math' && (
          <div className="pt-4 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 font-mono">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>
                  EXACT DIRAC BRA-KET STATE (
                  {activeStepScrub === -1
                    ? 'Initial |0...0⟩'
                    : activeStepScrub >= 90
                    ? 'Final Step'
                    : `After Step t${activeStepScrub}`}
                  )
                </span>
                <span className="text-cyan-400">
                  Hilbert Dim = 2^{qubitCount} ({1 << qubitCount} Basis Amplitudes)
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-cyan-300 tracking-wide overflow-x-auto whitespace-nowrap py-1">
                |ψ⟩ = {diracRepresentation}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
              {currentScrubStatevector.map((entry) => {
                const percent = (entry.probability * 100).toFixed(1);
                const hasProb = entry.probability > 0.001;
                return (
                  <div
                    key={entry.bitstring}
                    className={`rounded-xl border p-3 font-mono transition ${
                      hasProb
                        ? 'border-cyan-500/40 bg-cyan-950/20 text-white shadow-sm shadow-cyan-500/10'
                        : 'border-slate-800/80 bg-slate-950/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400">|{entry.bitstring}⟩</span>
                      <span className="text-[11px] font-bold">{percent}%</span>
                    </div>

                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-2 text-[10px] text-slate-300 truncate">
                      re: {entry.amplitude.re.toFixed(3)}, im: {entry.amplitude.im.toFixed(3)}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
                      <span>θ = {(entry.phase / Math.PI).toFixed(2)}π</span>
                      {hasProb && (
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-cyan-400 relative"
                          title={`Phase angle ${(entry.phase * (180 / Math.PI)).toFixed(0)}°`}
                        >
                          <span
                            className="absolute left-1/2 top-1/2 h-0.5 w-1.5 bg-cyan-300 origin-left"
                            style={{ transform: `rotate(${-entry.phase}rad)` }}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Reduced Single-Qubit Density Matrices & Bloch Vectors */}
        {activeTab === 'density' && (
          <div className="pt-4 space-y-4">
            <div className="text-xs text-slate-400 font-mono">
              Partial Trace <span className="text-amber-300">ρ_q = Tr_{'{≠q}'}(|ψ⟩⟨ψ|)</span> for each individual qubit wire: Purity Tr(ρ_q²) = 1.0 indicates a separable pure state; Tr(ρ_q²) = 0.5 indicates maximal entanglement.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reducedDensityMatrices.map((rdm) => (
                <div
                  key={rdm.qubit}
                  className={`rounded-xl border p-4 font-mono text-xs space-y-3 ${
                    rdm.isEntangled
                      ? 'border-violet-500/50 bg-violet-950/20'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      Qubit q_{rdm.qubit} {ancillaWires[rdm.qubit] ? '(Ancilla)' : ''}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        rdm.isEntangled
                          ? 'bg-violet-900/60 text-violet-300 border border-violet-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {rdm.isEntangled ? 'Entangled Mixed' : 'Separable Pure'}
                    </span>
                  </div>

                  {/* 2x2 Reduced Density Matrix */}
                  <div className="rounded-lg border border-slate-800 bg-[#0B0F19] p-2.5 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">2×2 Reduced Density Matrix ρ_{rdm.qubit}</div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="rounded bg-slate-900 py-1 text-cyan-300">
                        {complex.format(rdm.rho00)}
                      </div>
                      <div className="rounded bg-slate-900 py-1 text-slate-300">
                        {complex.format(rdm.rho01)}
                      </div>
                      <div className="rounded bg-slate-900 py-1 text-slate-300">
                        {complex.format(rdm.rho10)}
                      </div>
                      <div className="rounded bg-slate-900 py-1 text-cyan-300">
                        {complex.format(rdm.rho11)}
                      </div>
                    </div>
                  </div>

                  {/* Bloch Coordinates & Entanglement Entropy */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Bloch Vector (⟨X⟩, ⟨Y⟩, ⟨Z⟩):</span>
                      <span className="text-white">
                        ({rdm.bloch.x}, {rdm.bloch.y}, {rdm.bloch.z})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>State Purity Tr(ρ²):</span>
                      <span className={rdm.purity < 0.99 ? 'text-violet-300 font-bold' : 'text-emerald-400 font-bold'}>
                        {rdm.purity.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Entanglement Entropy S(ρ):</span>
                      <span className="text-amber-300">{rdm.entropy.toFixed(3)} bits</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Shots & QPU Histogram */}
        {activeTab === 'shots' && (
          <div className="pt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">Target Backend:</span>
                <select
                  value={selectedBackend}
                  onChange={(e) => setSelectedBackend(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="ideal">Ideal AerSimulator (Born Sampling)</option>
                  <option value="ibm_fez">Simulated Real QPU: ibm_fez (Heron 156Q)</option>
                  <option value="ibm_pittsburgh">Simulated Real QPU: ibm_pittsburgh (Nighthawk 133Q)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">Shots:</span>
                <div className="flex gap-1">
                  {[10, 100, 1000, 10000].map((s) => (
                    <button
                      key={s}
                      onClick={() => setShots(s)}
                      className={`rounded px-2.5 py-1 text-xs font-mono font-medium transition ${
                        shots === s
                          ? 'bg-violet-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition"
              >
                Sample {shots.toLocaleString()} Shots
              </button>
            </div>

            {simResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
                  <span>MEASUREMENT BITSTRING DISTRIBUTION ({simResult.backendName})</span>
                  <span>Execution Time: {simResult.executionTimeMs} ms</span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(simResult.counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([bstr, count]) => {
                      const pct = ((count / simResult.shots) * 100).toFixed(1);
                      const idealCount = simResult.idealCounts[bstr] || 0;
                      const idealPct = ((idealCount / simResult.shots) * 100).toFixed(1);
                      return (
                        <div key={bstr} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="font-bold text-white">|{bstr}⟩</span>
                            <span className="text-slate-300">
                              {count.toLocaleString()} counts ({pct}%)
                              {simResult.isNoisy && (
                                <span className="ml-2 text-slate-500 text-[10px]">(Ideal: {idealPct}%)</span>
                              )}
                            </span>
                          </div>
                          <div className="h-4 w-full rounded bg-slate-900 overflow-hidden flex">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Inline Hardware Transpiler & Topology View */}
        {activeTab === 'transpiler' && (
          <div className="pt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Physical Coupling Map:</span>
                <button
                  onClick={() => setTranspilerArch('heron')}
                  className={`rounded-lg px-3 py-1 text-xs font-mono transition ${
                    transpilerArch === 'heron'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  IBM Heron (Heavy-Hex CZ)
                </button>
                <button
                  onClick={() => setTranspilerArch('nighthawk')}
                  className={`rounded-lg px-3 py-1 text-xs font-mono transition ${
                    transpilerArch === 'nighthawk'
                      ? 'bg-violet-500 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  IBM Nighthawk (Tunable Grid ECR)
                </button>
              </div>
              <button
                onClick={() => setIsTranspilerOpen(true)}
                className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300 hover:bg-cyan-900/50"
              >
                Open Full Interactive Topology Map →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-400 text-[10px]">NATIVE 2Q ISA GATES</div>
                <div className="text-lg font-bold text-cyan-300 mt-1">
                  {transpilerReport.isaTwoQubitGates} {transpilerArch === 'heron' ? 'CZ' : 'ECR'}
                </div>
                <div className="text-[10px] text-slate-500">
                  +{transpilerReport.insertedSwaps} Routing SWAPs
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-400 text-[10px]">TOFFOLI DECOMPOSITION</div>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  {transpilerReport.toffoliDecomposed} CCX → {transpilerReport.toffoliDecomposed * 6} 2Q
                </div>
                <div className="text-[10px] text-slate-500">6× 2Q + 7× T/T† per CCX</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-400 text-[10px]">EFFECTIVE QUOPS</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {transpilerReport.quops.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">EPLG: {transpilerReport.eplg}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-400 text-[10px]">SURVIVAL FIDELITY</div>
                <div className="text-lg font-bold text-violet-300 mt-1">
                  {(transpilerReport.estimatedFidelity * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">ISA Depth: {transpilerReport.isaDepth}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Live Qiskit v2 Code Panel */}
        {activeTab === 'qiskit' && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>PYTHON CODE (QISKIT 1.x / 2.x SYNTAX)</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:text-white transition"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{qiskitCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Modals */}
      <UnitaryInspectorModal
        isOpen={!!selectedGateForInspect}
        onClose={() => setSelectedGateForInspect(null)}
        selectedGate={selectedGateForInspect}
      />

      <HardwareTranspilerModal
        isOpen={isTranspilerOpen}
        onClose={() => setIsTranspilerOpen(false)}
        qubitCount={qubitCount}
        gates={gates}
      />
    </div>
  );
};
