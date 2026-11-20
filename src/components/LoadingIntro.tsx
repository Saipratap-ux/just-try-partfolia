import React, { useEffect, useState } from 'react';

interface LoadingIntroProps {
  onComplete: () => void;
}

const LETTERS = ['S', 'A', 'I', 'P', 'R', 'A', 'T', 'A', 'P'];

export const LoadingIntro: React.FC<LoadingIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'reveal' | 'fade' | 'done'>('reveal');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPhase('done');
      onComplete();
      return;
    }

    const fadeTimer = window.setTimeout(() => setPhase('fade'), 950);
    const doneTimer = window.setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      role="status"
      aria-label="Loading Saipratap portfolio"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050814] text-white transition-opacity duration-400 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-6 px-6">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {LETTERS.map((char, idx) => (
            <span
              key={`${char}-${idx}`}
              className="font-display text-3xl sm:text-5xl font-bold tracking-wider text-white inline-block"
              style={{
                animation: `letterAssemble 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 45}ms both`,
                textShadow: '0 0 24px rgba(56, 189, 248, 0.45)',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        <div className="w-48 h-0.5 bg-slate-800 overflow-hidden rounded-full">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500"
            style={{
              animation: 'barFill 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setPhase('done');
            onComplete();
          }}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-md"
        >
          Skip Intro
        </button>
      </div>

      <style>{`
        @keyframes letterAssemble {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.88);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes barFill {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
