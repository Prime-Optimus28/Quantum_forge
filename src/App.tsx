import React, { useState, useMemo, useEffect } from 'react';
import { Navigation, FocusMode } from './components/Navigation';
import { GuidedLearnSplitView } from './components/GuidedLearnSplitView';
import { CircuitComposer } from './components/ComposerWorkspace/CircuitComposer';
import { CurriculumModule } from './components/CurriculumWorkspace/CurriculumModule';
import { AnthropicOptimizerLab } from './components/OptimizerWorkspace/AnthropicOptimizerLab';
import { CertificationExam } from './components/CertificationWorkspace/CertificationExam';
import { AITutorDrawer } from './components/TutorDrawer/AITutorDrawer';
import { InspectCodeMathDrawer } from './components/Drawers/InspectCodeMathDrawer';
import { GatePlacement, GateType } from './types/quantum';
import { simulateStatevector } from './utils/quantumEngine';
import { LEARNING_STAGES } from './data/curriculumData';

export default function App() {
  // Light Mode Default for Reading (#FAF9F6 Warm Alabaster)
  const [isDark, setIsDark] = useState<boolean>(false);

  // Focus Mode: 'learn' (Split-Pane Guided Learn) | 'lab' (Open Lab) | 'exam' (20-Question Exam)
  const [focusMode, setFocusMode] = useState<FocusMode>('learn');
  const [openLabSubTab, setOpenLabSubTab] = useState<'composer' | 'optimizer' | 'reference'>('composer');

  // Guided Learn Stage (1-4) & Micro-Step Index
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Drawers & Popovers
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [inspectDrawerOpen, setInspectDrawerOpen] = useState<boolean>(false);
  const [inspectDrawerTab, setInspectDrawerTab] = useState<'code' | 'math' | 'topology'>('code');
  const [inspectedGateType, setInspectedGateType] = useState<GateType | null>(null);

  // Global Circuit Canvas State (shared across Guided Learn, Open Lab, Code/Math Inspector, and Tutor)
  const [qubitCount, setQubitCount] = useState<number>(2);
  const [gates, setGates] = useState<GatePlacement[]>([
    { id: 'init_h', type: 'H', qubit: 0, step: 0 },
    { id: 'init_cx', type: 'CX', qubit: 0, target: 1, step: 1 },
  ]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className =
        'bg-[#090D16] text-[#F8FAFC] antialiased selection:bg-[#38BDF8]/20 selection:text-[#38BDF8]';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className =
        'bg-[#FAF9F6] text-[#0F172A] antialiased selection:bg-[#0284C7]/15 selection:text-[#0284C7]';
    }
  }, [isDark]);

  const statevector = useMemo(() => {
    try {
      return simulateStatevector(qubitCount, gates);
    } catch (err) {
      console.error('Statevector simulation error:', err);
      return [];
    }
  }, [qubitCount, gates]);

  const currentStageObj =
    LEARNING_STAGES.find((s) => s.stageNumber === activeStage) || LEARNING_STAGES[0];
  const currentStepObj =
    currentStageObj.steps[Math.min(activeStepIndex, currentStageObj.steps.length - 1)] ||
    currentStageObj.steps[0];

  const handleOpenInspectDrawer = (tab: 'code' | 'math' | 'topology' = 'code') => {
    setInspectedGateType(null);
    setInspectDrawerTab(tab);
    setInspectDrawerOpen(true);
  };

  const handleInspectGateMath = (gateType: GateType) => {
    setInspectedGateType(gateType);
    setInspectDrawerTab('math');
    setInspectDrawerOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isDark ? 'bg-[#090D16] text-[#F8FAFC]' : 'bg-[#FAF9F6] text-[#0F172A]'
      }`}
    >
      {/* Sleek 52px Top Bar */}
      <Navigation
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        activeStage={activeStage}
        setActiveStage={(stage) => {
          setActiveStage(stage);
          setActiveStepIndex(0);
        }}
        activeStepIndex={activeStepIndex}
        totalStepsInStage={currentStageObj.steps.length}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenInspectDrawer={handleOpenInspectDrawer}
      />

      {/* Main Content Area */}
      {focusMode === 'learn' && (
        <GuidedLearnSplitView
          activeStage={activeStage}
          setActiveStage={setActiveStage}
          activeStepIndex={activeStepIndex}
          setActiveStepIndex={setActiveStepIndex}
          qubitCount={qubitCount}
          setQubitCount={setQubitCount}
          gates={gates}
          setGates={setGates}
          isDark={isDark}
          onInspectGateMath={handleInspectGateMath}
          onOpenInspectDrawer={handleOpenInspectDrawer}
        />
      )}

      {focusMode === 'lab' && (
        <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Minimal Open Lab Sub-Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-500/15">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Open Quantum Laboratory
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
                Unconstrained 6-qubit statevector workbench, hardware transpiler, and Anthropic Pareto optimizer.
              </p>
            </div>
            <div
              className={`flex items-center rounded-lg p-0.5 border ${
                isDark ? 'bg-[#111827] border-white/10' : 'bg-[#FFFFFF] border-[#E5E7EB]'
              }`}
            >
              {[
                { id: 'composer', label: 'Full Circuit Studio' },
                { id: 'optimizer', label: 'AI Pareto Optimizer Lab' },
                { id: 'reference', label: 'Spin Physics & Reference' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setOpenLabSubTab(t.id as 'composer' | 'optimizer' | 'reference')
                  }
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    openLabSubTab === t.id
                      ? isDark
                        ? 'bg-[#1E293B] text-[#38BDF8]'
                        : 'bg-[#FAF9F6] text-[#0284C7] border border-[#E5E7EB]'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {openLabSubTab === 'composer' && (
            <CircuitComposer
              qubitCount={qubitCount}
              setQubitCount={setQubitCount}
              gates={gates}
              setGates={setGates}
              statevector={statevector}
            />
          )}

          {openLabSubTab === 'optimizer' && (
            <AnthropicOptimizerLab
              onLoadCircuitIntoComposer={(newQubits, newGates) => {
                setQubitCount(newQubits);
                setGates(newGates);
                setOpenLabSubTab('composer');
              }}
            />
          )}

          {openLabSubTab === 'reference' && <CurriculumModule />}
        </main>
      )}

      {focusMode === 'exam' && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CertificationExam />
        </main>
      )}

      {/* On-Demand Slide-Over Drawer: Qiskit v2 Code, Unitary & Density Matrices, Hardware ISA Topology */}
      <InspectCodeMathDrawer
        isOpen={inspectDrawerOpen}
        onClose={() => setInspectDrawerOpen(false)}
        initialTab={inspectDrawerTab}
        selectedGateType={inspectedGateType}
        qubitCount={qubitCount}
        gates={gates}
        statevector={statevector}
        shots={1000}
        isDark={isDark}
      />

      {/* Floating Bottom-Right AI Tutor Command Pill & Popover (⌘K) */}
      <AITutorDrawer
        isOpen={isTutorOpen}
        onToggle={() => setIsTutorOpen((prev) => !prev)}
        onClose={() => setIsTutorOpen(false)}
        qubitCount={qubitCount}
        gates={gates}
        statevector={statevector}
        activeLesson={
          focusMode === 'learn'
            ? `${currentStageObj.shortTitle} — ${currentStepObj.title}`
            : focusMode === 'lab'
            ? `Open Lab (${openLabSubTab})`
            : '20-Question Certification Exam'
        }
        isDark={isDark}
      />
    </div>
  );
}
