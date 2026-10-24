import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXAM_QUESTIONS } from '../../data/examQuestions';

export const CertificationExam: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('Quantum Explorer');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const totalQuestions = EXAM_QUESTIONS.length;
  const currentQ = EXAM_QUESTIONS[currentQuestionIndex];

  // Calculate score
  const correctCount = Object.entries(selectedAnswers).reduce((acc, [qIdStr, optIdx]) => {
    const q = EXAM_QUESTIONS.find((item) => item.id === parseInt(qIdStr));
    if (q && q.correctIndex === optIdx) return acc + 1;
    return acc;
  }, 0);

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = scorePercentage >= 75;

  const handleSelectOption = (optIdx: number) => {
    if (isExamSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIdx,
    }));
    // automatically show explanation once answered
    setShowExplanation((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
  };

  const handleSubmitExam = () => {
    setIsExamSubmitted(true);
    if (scorePercentage >= 75) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setShowCertificate(true);
    }
  };

  const handleResetExam = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setIsExamSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowCertificate(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-[#111827] p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">20-Question Quantum Specialist Certification Exam</h2>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs font-mono text-emerald-400 font-bold border border-emerald-800">
                  Passing Score: 75% (15/20)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modeled on IBM Quantum Learning Exam & Anthropic Quantum Circuit Optimization Principles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Progress:</span>
            <span className="font-bold text-emerald-400">
              {Object.keys(selectedAnswers).length} / {totalQuestions} Answered
            </span>
          </div>
        </div>
      </div>

      {/* Question Index Navigator */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>QUESTION NAVIGATOR</span>
          <span>Click number to jump</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAM_QUESTIONS.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = currentQuestionIndex === idx;
            const isCorrect = isAnswered && selectedAnswers[q.id] === q.correctIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-8 w-8 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-emerald-400 bg-slate-800 text-white'
                    : isAnswered
                    ? isCorrect
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-slate-900 text-slate-500 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-violet-950 px-2.5 py-1 text-xs font-mono text-violet-300 font-bold border border-violet-800">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">
              Category: {currentQ.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-base font-semibold text-white leading-relaxed">{currentQ.question}</h3>

        {/* Multiple Choice Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentQ.id] === optIdx;
            const isCorrect = currentQ.correctIndex === optIdx;
            const hasAnswered = selectedAnswers[currentQ.id] !== undefined;

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full rounded-xl border p-4 text-left transition text-xs font-sans flex items-center justify-between ${
                  isSelected
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                      : 'border-rose-500 bg-rose-950/40 text-rose-200'
                    : hasAnswered && isCorrect
                    ? 'border-emerald-600 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-800 bg-[#0B0F19] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 font-mono text-xs font-bold">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </div>

                {hasAnswered && (
                  <div>
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Step-by-Step Mathematical Explanation */}
        {showExplanation[currentQ.id] && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-violet-400 font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Step-by-Step Mathematical Explanation:</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">{currentQ.explanation}</p>
          </div>
        )}

        {/* Submit & Reset Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetExam}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Exam</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Current Score: <strong className="text-white">{correctCount} / {totalQuestions}</strong> ({scorePercentage}%)
            </span>

            <button
              onClick={handleSubmitExam}
              disabled={Object.keys(selectedAnswers).length < totalQuestions}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 transition"
            >
              Submit Exam & Generate Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal / Preview */}
      {showCertificate && (
        <div className="rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-b from-[#111827] to-[#0B0F19] p-8 shadow-2xl text-center space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-center print:hidden">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>VERIFIED BADGE ATTAINED: {scorePercentage}% SCORE</span>
            </div>
            <button
              onClick={handlePrintCertificate}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>

          <div className="border border-emerald-500/30 rounded-2xl p-8 bg-[#0B0F19]/90 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/20 border border-emerald-400/40 text-emerald-400 shadow-xl shadow-emerald-500/20">
                  <Award className="h-9 w-9" />
                </div>
              </div>

              <h1 className="text-2xl font-bold font-mono tracking-wider text-white uppercase">
                Certificate of Quantum Excellence
              </h1>
              <p className="text-xs text-slate-400 font-mono">QuantumForge Studio & IBM Quantum Learning Lab</p>

              <div className="py-4">
                <p className="text-xs text-slate-400">This certifies that</p>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mt-1 text-center font-bold text-xl sm:text-2xl text-cyan-300 bg-transparent border-b border-cyan-500/40 focus:outline-none focus:border-cyan-400"
                  placeholder="Enter Your Full Name"
                />
                <p className="mt-2 text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  has demonstrated rigorous mastery of Quantum Mechanics Basics, Qiskit v2 Patterns, Two-Spin Hamiltonian Evolution, Reversible Uncomputation, and Anthropic-Inspired AI Circuit Optimization with a passing score of <strong>{scorePercentage}%</strong>.
                </p>
              </div>

              <div className="flex items-center justify-around border-t border-slate-800 pt-6 text-left font-mono text-xs text-slate-400">
                <div>
                  <div className="text-slate-500 text-[10px]">VERIFICATION ID</div>
                  <div className="text-white font-bold">QF-2026-CERT-{Math.floor(100000 + Math.random() * 900000)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">ISSUED DATE</div>
                  <div className="text-white font-bold">{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">STATUS</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> ACCREDITED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
