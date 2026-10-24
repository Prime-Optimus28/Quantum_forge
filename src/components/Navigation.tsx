import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  ChevronDown,
  Code2,
  Award,
  Check,
  BookOpen,
  FlaskConical,
} from 'lucide-react';
import { LEARNING_STAGES } from '../data/curriculumData';

export type WorkspaceId = 'composer' | 'curriculum' | 'optimizer' | 'certification';
export type FocusMode = 'learn' | 'lab' | 'exam';

interface NavigationProps {
  focusMode: FocusMode;
  setFocusMode: (mode: FocusMode) => void;
  activeStage: 1 | 2 | 3 | 4;
  setActiveStage: (stage: 1 | 2 | 3 | 4) => void;
  activeStepIndex: number;
  totalStepsInStage: number;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenInspectDrawer: (tab?: 'code' | 'math' | 'topology') => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  focusMode,
  setFocusMode,
  activeStage,
  setActiveStage,
  activeStepIndex,
  totalStepsInStage,
  isDark,
  toggleTheme,
  onOpenInspectDrawer,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStageObj =
    LEARNING_STAGES.find((s) => s.stageNumber === activeStage) || LEARNING_STAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-[52px] w-full border-b transition-colors ${
        isDark
          ? 'bg-[#090D16]/95 border-white/[0.07] text-[#F8FAFC]'
          : 'bg-[#FFFFFF]/95 border-[#E5E7EB] text-[#0F172A]'
      } backdrop-blur-md`}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* LEFT: Minimal Brand Mark + Stage Breadcrumb Selector + 20-Question Exam Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFocusMode('learn')}
            className="flex items-center gap-2 text-left focus:outline-none group"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-semibold border transition-colors ${
                isDark
                  ? 'bg-[#111827] border-white/10 text-[#38BDF8]'
                  : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#0284C7]'
              }`}
            >
              |ψ⟩
            </span>
            <span className="font-semibold tracking-tight text-sm hidden sm:inline">
              QuantumForge
            </span>
          </button>

          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>/</span>

          {/* Breadcrumb Dropdown for the 4 Core Learning Stages */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                focusMode === 'learn'
                  ? isDark
                    ? 'bg-[#111827] border-white/10 text-[#F8FAFC] hover:border-white/20'
                    : 'bg-[#FAF9F6] border-[#E5E7EB] text-[#0F172A] hover:border-slate-300'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <span>{currentStageObj.shortTitle}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {dropdownOpen && (
              <div
                className={`absolute left-0 mt-1.5 w-72 rounded-lg border p-1.5 shadow-xl z-50 ${
                  isDark
                    ? 'bg-[#111827] border-white/10 text-[#F8FAFC]'
                    : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#0F172A]'
                }`}
              >
                <div
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-[#475569]'
                  }`}
                >
                  Core Learning Stages
                </div>
                {LEARNING_STAGES.map((stage) => {
                  const isSelected =
                    focusMode === 'learn' && activeStage === stage.stageNumber;
                  return (
                    <button
                      key={stage.stageNumber}
                      onClick={() => {
                        setActiveStage(stage.stageNumber);
                        setFocusMode('learn');
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-sky-500/15 text-[#38BDF8] font-medium'
                            : 'bg-sky-50 text-[#0284C7] font-medium'
                          : isDark
                          ? 'text-slate-300 hover:bg-white/[0.04]'
                          : 'text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>{stage.shortTitle}</div>
                        <div
                          className={`text-[10px] ${
                            isDark ? 'text-slate-400' : 'text-[#475569]'
                          }`}
                        >
                          {stage.steps.length} interactive steps
                        </div>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 20-Question Exam Trigger */}
          <button
            onClick={() => setFocusMode('exam')}
            className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              focusMode === 'exam'
                ? isDark
                  ? 'bg-teal-500/15 border-teal-500/30 text-[#2DD4BF]'
                  : 'bg-teal-50 border-teal-200 text-[#0D9488]'
                : isDark
                ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                : 'border-transparent text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/70'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>20-Question Exam</span>
          </button>
        </div>

        {/* CENTER: Segmented 2-Mode Toggle ["Guided Learn Mode" | "Open Lab Mode"] */}
        <div
          className={`flex items-center rounded-lg p-0.5 border ${
            isDark
              ? 'bg-[#111827] border-white/[0.07]'
              : 'bg-[#FAF9F6] border-[#E5E7EB]'
          }`}
        >
          <button
            onClick={() => setFocusMode('learn')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              focusMode === 'learn'
                ? isDark
                  ? 'bg-[#1E293B] text-[#F8FAFC] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#0F172A] shadow-xs border border-[#E5E7EB]/60'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Guided Learn Mode</span>
          </button>
          <button
            onClick={() => setFocusMode('lab')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              focusMode === 'lab'
                ? isDark
                  ? 'bg-[#1E293B] text-[#F8FAFC] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#0F172A] shadow-xs border border-[#E5E7EB]/60'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>Open Lab Mode</span>
          </button>
        </div>

        {/* RIGHT: Minimal Step Progress Indicator, Inspect Code & Math Drawer Button, Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {focusMode === 'learn' && (
            <span
              className={`hidden lg:inline-block font-mono text-xs ${
                isDark ? 'text-slate-400' : 'text-[#475569]'
              }`}
            >
              Step {activeStepIndex + 1} of {totalStepsInStage}
            </span>
          )}

          <button
            onClick={() => onOpenInspectDrawer('code')}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              isDark
                ? 'bg-[#111827] border-white/10 text-slate-200 hover:border-white/20'
                : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#0F172A] hover:bg-[#FAF9F6]'
            }`}
            title="Inspect Qiskit v2 Code, Unitary Matrices, and Hardware Topology"
          >
            <Code2 className="h-3.5 w-3.5 opacity-75" />
            <span className="hidden sm:inline">Inspect Code & Math</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
              isDark
                ? 'bg-[#111827] border-white/10 text-slate-300 hover:text-white'
                : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#475569] hover:text-[#0F172A]'
            }`}
            title={isDark ? 'Switch to Light Reading Mode' : 'Switch to Obsidian Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
