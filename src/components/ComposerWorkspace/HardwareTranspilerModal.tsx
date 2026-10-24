import React, { useState, useMemo } from 'react';
import {
  X,
  Cpu,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Activity,
  Layers,
  GitBranch,
} from 'lucide-react';
import { GatePlacement } from '../../types/quantum';
import { transpileCircuitToHardware } from '../../utils/quantumEngine';

interface HardwareTranspilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  qubitCount: number;
  gates: GatePlacement[];
}

export const HardwareTranspilerModal: React.FC<HardwareTranspilerModalProps> = ({
  isOpen,
  onClose,
  qubitCount,
  gates,
}) => {
  const [architecture, setArchitecture] = useState<'heron' | 'nighthawk'>('heron');
  const [optLevel, setOptLevel] = useState<number>(3);

  const report = useMemo(() => {
    return transpileCircuitToHardware(qubitCount, gates, architecture, optLevel);
  }, [qubitCount, gates, architecture, optLevel]);

  if (!isOpen) return null;

  // Node coordinates for SVG Coupling Map (6 physical qubits)
  const nodePositions: Record<number, { x: number; y: number }> =
    architecture === 'heron'
      ? {
          // Heavy-Hex layout: hexagonal unit cell with bridge qubit
          0: { x: 70, y: 65 },
          1: { x: 170, y: 45 },
          2: { x: 290, y: 45 },
          3: { x: 390, y: 65 },
          4: { x: 230, y: 125 },
          5: { x: 350, y: 135 },
        }
      : {
          // Nighthawk Tunable 2x3 Grid layout
          0: { x: 100, y: 50 },
          1: { x: 230, y: 50 },
          2: { x: 360, y: 50 },
          3: { x: 100, y: 130 },
          4: { x: 230, y: 130 },
          5: { x: 360, y: 130 },
        };

  const physicalEdges: [number, number][] =
    architecture === 'heron'
      ? [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [1, 4],
        ]
      : [
          [0, 1],
          [1, 2],
          [3, 4],
          [4, 5],
          [0, 3],
          [1, 4],
          [2, 5],
        ];

  const isEdgeActive = (u: number, v: number) =>
    report.activeCouplingEdges.some(
      ([a, b]) => (a === u && b === v) || (a === v && b === u)
    );

  const isSwapEdge = (u: number, v: number) =>
    report.swapEdges.some(
      ([a, b]) => (a === u && b === v) || (a === v && b === u)
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Qiskit Hardware Transpiler & Topology Visualizer
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800">
                  generate_preset_pass_manager(optimization_level={optLevel})
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Maps logical circuit onto physical coupling topologies, inserts routing SWAPs, and decomposes Toffoli into native ISA gates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target Architecture Selector */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setArchitecture('heron')}
            className={`rounded-xl border p-4 text-left transition ${
              architecture === 'heron'
                ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm shadow-cyan-500/20'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300">IBM Heron r2 (ibm_fez) — Heavy-Hex</span>
              <span className="rounded bg-cyan-900/60 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">156 Qubits</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Degree-2/3 Heavy-Hex lattice minimizing microwave crosstalk and frequency collisions.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-300">
              Native Basis Gates: <span className="text-cyan-300">[SX, X, RZ, CZ]</span> | EPLG: 1.8 × 10⁻³
            </div>
          </button>

          <button
            onClick={() => setArchitecture('nighthawk')}
            className={`rounded-xl border p-4 text-left transition ${
              architecture === 'nighthawk'
                ? 'border-violet-500 bg-violet-950/30 text-white shadow-sm shadow-violet-500/20'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-violet-300">IBM Nighthawk (ibm_pittsburgh) — Tunable Grid</span>
              <span className="rounded bg-violet-900/60 px-2 py-0.5 text-[10px] text-violet-300 font-mono">133 Qubits</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Higher-connectivity tunable coupler mesh reducing SWAP routing overhead for dense circuits.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-300">
              Native Basis Gates: <span className="text-violet-300">[SX, X, RZ, ECR]</span> | EPLG: 1.2 × 10⁻³
            </div>
          </button>
        </div>

        {/* Transpiler Pass Manager Optimization Level */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <RefreshCw className="h-4 w-4 text-cyan-400" />
            <span>Transpiler Pass Manager Level:</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { lvl: 1, label: 'Level 1 (Light Routing)' },
              { lvl: 2, label: 'Level 2 (Gate Commutation)' },
              { lvl: 3, label: 'Level 3 (SABRE + Unitary Synthesis)' },
            ].map(({ lvl, label }) => (
              <button
                key={lvl}
                onClick={() => setOptLevel(lvl)}
                className={`rounded px-3 py-1 font-mono text-xs transition ${
                  optLevel === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive SVG Coupling Map & Routing Topology */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>
                PHYSICAL COUPLING MAP ({architecture === 'heron' ? 'HEAVY-HEX SUBLATTICE' : 'TUNABLE 2D MESH'})
              </span>
              <span className="text-cyan-400">Active Qubits: {qubitCount} / 6</span>
            </div>

            <svg viewBox="0 0 460 180" className="w-full h-44 bg-[#0B0F19] rounded-lg border border-slate-900">
              {/* Physical Coupling Edges */}
              {physicalEdges.map(([u, v], idx) => {
                const posU = nodePositions[u];
                const posV = nodePositions[v];
                const active = isEdgeActive(u, v);
                return (
                  <g key={idx}>
                    <line
                      x1={posU.x}
                      y1={posU.y}
                      x2={posV.x}
                      y2={posV.y}
                      stroke={active ? '#38BDF8' : '#334155'}
                      strokeWidth={active ? 4 : 2}
                    />
                    {active && (
                      <text
                        x={(posU.x + posV.x) / 2}
                        y={(posU.y + posV.y) / 2 - 6}
                        fill="#38BDF8"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {architecture === 'heron' ? 'CZ' : 'ECR'}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Non-local Routed SWAP Paths */}
              {report.swapEdges.map(([u, v], idx) => {
                const posU = nodePositions[u];
                const posV = nodePositions[v];
                if (!posU || !posV) return null;
                return (
                  <g key={`swap_${idx}`}>
                    <line
                      x1={posU.x}
                      y1={posU.y}
                      x2={posV.x}
                      y2={posV.y}
                      stroke="#F97316"
                      strokeWidth={2.5}
                      strokeDasharray="5,4"
                    />
                    <text
                      x={(posU.x + posV.x) / 2}
                      y={(posU.y + posV.y) / 2 + 12}
                      fill="#F97316"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      SWAP Route
                    </text>
                  </g>
                );
              })}

              {/* Physical Qubit Nodes */}
              {Object.entries(nodePositions).map(([qStr, pos]) => {
                const q = parseInt(qStr);
                const isUsed = q < qubitCount;
                return (
                  <g key={q}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={19}
                      fill={isUsed ? '#0284C7' : '#1E293B'}
                      stroke={isUsed ? '#38BDF8' : '#475569'}
                      strokeWidth={2.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      fill={isUsed ? '#FFFFFF' : '#64748B'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      Q{q}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block" /> Direct Native Link
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400 inline-block" /> Routed SWAP Bridge
                </span>
              </div>
              <span>Inserted SWAPs: {report.insertedSwaps}</span>
            </div>
          </div>

          {/* Logical vs ISA Metrics Comparison */}
          <div className="lg:col-span-2 rounded-xl border border-cyan-800/60 bg-cyan-950/20 p-4 flex flex-col justify-between font-mono text-xs">
            <div>
              <h4 className="uppercase tracking-wider text-cyan-300 mb-3 flex items-center justify-between font-bold">
                <span>ISA Compilation Summary</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-cyan-900/40">
                  <span className="text-slate-400">Logical Gates:</span>
                  <span className="text-white font-bold">{report.logicalGates}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyan-900/40">
                  <span className="text-slate-400">Toffolis Decomposed:</span>
                  <span className={report.toffoliDecomposed > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {report.toffoliDecomposed} (×6 2Q ISA each)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyan-900/40">
                  <span className="text-slate-400">SABRE Routing SWAPs:</span>
                  <span className="text-orange-400 font-bold">+{report.insertedSwaps} SWAPs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyan-900/40">
                  <span className="text-slate-400">Native 2-Qubit Gates:</span>
                  <span className="text-cyan-300 font-bold">
                    {report.isaTwoQubitGates} {architecture === 'heron' ? 'CZ' : 'ECR'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-cyan-900/40">
                  <span className="text-slate-400">Native 1-Qubit Gates:</span>
                  <span className="text-slate-200">{report.isaSingleQubitGates} (SX / RZ)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Compiled ISA Depth:</span>
                  <span className="text-emerald-400 font-bold">{report.isaDepth} layers</span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-slate-950/90 p-2.5 border border-slate-800 text-[11px] text-slate-300 font-sans">
              Estimated Circuit Survival Fidelity:{' '}
              <strong className="font-mono text-emerald-400">{(report.estimatedFidelity * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        {/* Gate-by-Gate Native ISA Decomposition Table */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
            <span>GATE-BY-GATE NATIVE ISA DECOMPOSITION SCHEDULE</span>
            <span className="text-cyan-400">Zero-Duration Virtual RZ Frame Tracking Enabled</span>
          </div>

          <div className="max-h-44 overflow-y-auto space-y-1.5 font-mono text-xs">
            {report.decomposedInstructions.length === 0 ? (
              <div className="text-slate-500 py-4 text-center">No logical gates on canvas to transpile.</div>
            ) : (
              report.decomposedInstructions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-[#0B0F19] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">t{item.step}</span>
                    <span className="font-bold text-white">{item.sourceGate}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    <div className="flex flex-wrap gap-1">
                      {item.isaSequence.map((isa, i) => (
                        <span
                          key={i}
                          className="rounded bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 text-[10px] text-cyan-300"
                        >
                          {isa}
                        </span>
                      ))}
                    </div>
                  </div>
                  {item.routingPath && (
                    <span
                      className={`text-[10px] ${
                        item.isSwapInserted ? 'text-orange-400 font-bold' : 'text-emerald-400'
                      }`}
                    >
                      {item.routingPath}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scale, Quality & Speed Hardware Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Effective QuOps</div>
            <div className="mt-1 text-base font-bold text-white font-mono">{report.quops.toLocaleString()} QuOps</div>
            <div className="text-[10px] text-emerald-400">Reliable Operations</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Quality (EPLG)</div>
            <div className="mt-1 text-base font-bold text-cyan-300 font-mono">{report.eplg}</div>
            <div className="text-[10px] text-slate-400">Error Per Layered Gate</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Circuit Fidelity</div>
            <div className="mt-1 text-base font-bold text-violet-300 font-mono">
              {(report.estimatedFidelity * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">Survival Estimate</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
          >
            Close Transpiler View
          </button>
        </div>
      </div>
    </div>
  );
};
