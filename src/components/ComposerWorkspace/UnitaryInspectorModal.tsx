import React from 'react';
import { X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Complex, GatePlacement } from '../../types/quantum';
import { complex, getGateMatrix, getCNOTMatrix, isUnitary } from '../../utils/quantumEngine';

interface UnitaryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGate: GatePlacement | null;
}

export const UnitaryInspectorModal: React.FC<UnitaryInspectorModalProps> = ({
  isOpen,
  onClose,
  selectedGate,
}) => {
  if (!isOpen || !selectedGate) return null;

  const isMulti = selectedGate.type === 'CX' || selectedGate.type === 'CZ' || selectedGate.type === 'SWAP' || selectedGate.type === 'CCX';

  let matrix: Complex[][] = [];
  if (selectedGate.type === 'CX') {
    matrix = getCNOTMatrix(selectedGate.qubit, selectedGate.target !== undefined ? selectedGate.target : selectedGate.qubit + 1);
  } else if (!isMulti) {
    matrix = getGateMatrix(selectedGate.type, selectedGate.angle || 0);
  } else {
    // For CZ/SWAP demo 4x4 representation
    matrix = Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => complex.create(r === c ? 1 : 0, 0))
    );
    if (selectedGate.type === 'CZ') {
      matrix[3][3] = complex.create(-1, 0);
    } else if (selectedGate.type === 'SWAP') {
      matrix[1][1] = complex.create(0, 0);
      matrix[1][2] = complex.create(1, 0);
      matrix[2][1] = complex.create(1, 0);
      matrix[2][2] = complex.create(0, 0);
    }
  }

  const unitaryValid = isUnitary(matrix);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Unitary Matrix Inspector: <span className="font-mono text-cyan-400">{selectedGate.type} Gate</span>
            </h3>
            <p className="text-xs text-slate-400">
              Qubit {selectedGate.qubit} {selectedGate.target !== undefined ? `→ Qubit ${selectedGate.target}` : ''} | Step {selectedGate.step}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Matrix Visualization */}
        <div className="my-5">
          <div className="text-xs font-mono text-slate-400 mb-2">
            Dimension: {matrix.length} × {matrix[0]?.length} Unitary Operator U
          </div>

          <div className="relative inline-block w-full overflow-x-auto rounded-xl border border-slate-800 bg-[#0B0F19] p-4 text-center">
            <table className="mx-auto border-separate border-spacing-2 font-mono text-xs">
              <tbody>
                {matrix.map((row, r) => (
                  <tr key={r}>
                    {row.map((val, c) => {
                      const str = complex.format(val);
                      const isNonZero = Math.abs(val.re) > 1e-4 || Math.abs(val.im) > 1e-4;
                      return (
                        <td
                          key={c}
                          className={`rounded px-2.5 py-1.5 transition-colors ${
                            isNonZero
                              ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/60'
                              : 'bg-slate-900/60 text-slate-600'
                          }`}
                        >
                          {str}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reversibility & Unitary Verification */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-300">Unitary Invariant U† · U = I:</span>
            {unitaryValid ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Verified (Norm Preserving)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <ShieldAlert className="h-4 w-4" /> Approximate
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Unitary gates represent reversible quantum physics: length is conserved (total probability equals 1), and applying the Hermitian adjoint U† completely reverses the gate operation without loss of quantum information.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
