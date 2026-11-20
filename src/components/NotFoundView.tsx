import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface NotFoundViewProps {
  onReturnHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onReturnHome }) => {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-28 flex flex-col items-center text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/95 text-blue-600 dark:text-cyan-400 mb-6">
        <Compass className="w-7 h-7" />
      </div>
      <p className="font-mono text-sm font-semibold text-blue-600 dark:text-cyan-400">
        404 · Route Not Found
      </p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
        Lost in the Digital Universe
      </h1>
      <p className="mt-4 max-w-md text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        The sector you requested does not exist in Saipratap&apos;s portfolio coordinates. Return
        to the main showcase to explore projects and skills.
      </p>
      <button
        type="button"
        onClick={() => {
          audioEngine.playTransition();
          onReturnHome();
        }}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return Home</span>
      </button>
    </main>
  );
};
