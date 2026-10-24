import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { GatePlacement, StatevectorEntry } from '../../types/quantum';
import { formatDiracNotation } from '../../utils/quantumEngine';

interface AITutorDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  qubitCount: number;
  gates: GatePlacement[];
  statevector: StatevectorEntry[];
  activeLesson?: string;
  isDark?: boolean;
}

interface Message {
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onToggle,
  onClose,
  qubitCount,
  gates,
  statevector,
  activeLesson,
  isDark = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'tutor',
      text: `I have live context on your ${qubitCount}-qubit circuit and current lesson step. Ask about Dirac amplitudes, Bell states, Qiskit v2 primitives, or reversible uncomputation.`,
      timestamp: 'Ready',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Bind Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const hasToffoli = gates.some((g) => g.type === 'CCX');
  const diracForm = formatDiracNotation(statevector);
  const ancillaWarning =
    hasToffoli &&
    gates.filter((g) => g.type === 'CCX').length % 2 !== 0 &&
    gates.length > 2;

  const quickPrompts = [
    'Diagnose circuit & uncomputation',
    'Explain current Dirac statevector',
    'Transform |Φ⁺⟩ into |Ψ⁻⟩',
    'Suggest Toffoli & gate reductions',
  ];

  const handleSend = async (questionToSend?: string) => {
    const q = questionToSend || input.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionToSend) setInput('');
    setLoading(true);

    try {
      const gateTypes = gates.map((g) => g.type);
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          activeLesson,
          circuitSummary: {
            qubitCount,
            totalGates: gates.length,
            gateTypes,
            gates,
            diracForm,
            hasAncillaLeak: ancillaWarning,
            ancillaStatus: ancillaWarning ? 'Scratch qubit entangled/uncomputed' : 'clean',
          },
        }),
      });

      const data = await res.json();
      const tutorReply = data.response || data.fallback || 'Circuit state analyzed.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: tutorReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: `Local state analysis: ${qubitCount} wires in state |ψ⟩ = ${diracForm}. Remember Qiskit indexes q₀ at the rightmost bit position.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Glassmorphic Popover */}
      {isOpen && (
        <div
          className={`mb-3 flex h-[480px] w-[360px] sm:w-[400px] flex-col rounded-xl border shadow-2xl backdrop-blur-xl transition-all ${
            isDark
              ? 'bg-[#111827]/95 border-white/10 text-[#F8FAFC]'
              : 'bg-[#FFFFFF]/95 border-[#E5E7EB] text-[#0F172A]'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b px-4 py-3 ${
              isDark ? 'border-white/[0.07]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className={`h-4 w-4 ${isDark ? 'text-[#A855F7]' : 'text-[#7C3AED]'}`}
              />
              <div>
                <h3 className="text-xs font-semibold tracking-tight">
                  Quantum Tutor
                </h3>
                <p
                  className={`text-[10px] font-mono truncate max-w-[240px] ${
                    isDark ? 'text-slate-400' : 'text-[#475569]'
                  }`}
                >
                  {activeLesson || 'Interactive Stage'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`rounded-md p-1 transition-colors ${
                isDark
                  ? 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
              aria-label="Close Quantum Tutor"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Live Statevector Strip */}
          <div
            className={`border-b px-4 py-2 text-[11px] font-mono ${
              isDark
                ? 'bg-[#090D16]/70 border-white/[0.07]'
                : 'bg-[#FAF9F6] border-[#E5E7EB]'
            }`}
          >
            <div className="truncate">
              <span className="opacity-60">|ψ⟩ = </span>
              <span className={isDark ? 'text-[#38BDF8]' : 'text-[#0284C7]'}>
                {diracForm}
              </span>
            </div>
            {ancillaWarning ? (
              <div
                className={`mt-1 flex items-center gap-1 text-[10px] ${
                  isDark ? 'text-[#F97316]' : 'text-[#D97706]'
                }`}
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>Uncomputed CCX scratch gate detected</span>
              </div>
            ) : (
              <div
                className={`mt-1 flex items-center gap-1 text-[10px] ${
                  isDark ? 'text-[#2DD4BF]' : 'text-[#0D9488]'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>{qubitCount}Q · {gates.length} gates · Coherent</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? isDark
                        ? 'bg-[#38BDF8] text-[#090D16] font-medium'
                        : 'bg-[#0F172A] text-[#FFFFFF]'
                      : isDark
                      ? 'bg-[#090D16] text-slate-200 border border-white/[0.07]'
                      : 'bg-[#FAF9F6] text-[#0F172A] border border-[#E5E7EB]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div
                className={`flex items-center gap-2 text-xs font-mono ${
                  isDark ? 'text-[#A855F7]' : 'text-[#7C3AED]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating circuit unitary...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div
            className={`border-t px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar ${
              isDark ? 'border-white/[0.07]' : 'border-[#E5E7EB]'
            }`}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${
                  isDark
                    ? 'bg-[#090D16] border-white/10 text-slate-300 hover:border-purple-400/50'
                    : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className={`flex items-center gap-1.5 border-t p-2.5 ${
              isDark ? 'border-white/[0.07]' : 'border-[#E5E7EB]'
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this step..."
              className={`flex-1 rounded-md border px-2.5 py-1.5 text-xs focus:outline-none ${
                isDark
                  ? 'bg-[#090D16] border-white/10 text-white placeholder-slate-500 focus:border-purple-400'
                  : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#0F172A] placeholder-slate-400 focus:border-[#7C3AED]'
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`rounded-md p-1.5 transition-colors disabled:opacity-40 ${
                isDark
                  ? 'bg-[#A855F7] text-[#090D16] hover:bg-purple-400'
                  : 'bg-[#7C3AED] text-white hover:bg-purple-700'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bottom-Right Command Trigger */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 ${
          isDark
            ? 'bg-[#111827]/95 border-white/15 text-[#F8FAFC] hover:border-purple-400/50'
            : 'bg-[#FFFFFF]/95 border-[#E5E7EB] text-[#0F172A] hover:border-slate-300'
        }`}
      >
        <MessageSquare
          className={`h-3.5 w-3.5 ${isDark ? 'text-[#A855F7]' : 'text-[#7C3AED]'}`}
        />
        <span>Ask Quantum Tutor</span>
        <kbd
          className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
            isDark
              ? 'bg-[#090D16] border-white/10 text-slate-400'
              : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#475569]'
          }`}
        >
          ⌘K
        </kbd>
      </button>
    </div>
  );
};
