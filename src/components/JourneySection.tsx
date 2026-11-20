import React from 'react';
import { JOURNEY_MILESTONES, VERIFIED_HIGHLIGHTS } from '../data/portfolioData';
import { audioEngine } from '../utils/audioEngine';

export const JourneySection: React.FC = () => {
  return (
    <section
      id="journey"
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-slate-800/70"
    >
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          04. My Journey &amp; Milestones
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Learning Path &amp; Project Evolution
        </h2>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
          How hands-on experimentation across web pages, 3D interfaces, and Kotlin mobile apps shaped my engineering foundation.
        </p>
      </div>

      {/* Clean 2-column grid of Journey Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {JOURNEY_MILESTONES.map((step, index) => (
          <article
            key={step.title}
            onMouseEnter={() => audioEngine.playHover()}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-6 sm:p-7 hover:border-blue-500/50 dark:hover:border-cyan-400/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4 text-xs font-mono text-blue-600 dark:text-cyan-400">
              <span>0{index + 1}. {step.period}</span>
              <span className="text-slate-500 dark:text-slate-400 truncate">{step.context}</span>
            </div>

            <h3 className="mt-2.5 font-display text-xl font-bold text-slate-900 dark:text-white">
              {step.title}
            </h3>

            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {step.description}
            </p>

            <p className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-mono text-slate-500 dark:text-slate-400">
              Repositories: {step.artifacts.join(' · ')}
            </p>
          </article>
        ))}
      </div>

      {/* Verified Highlights Strip */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {VERIFIED_HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#080e20]/95 p-6"
          >
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
              {item.label}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900 dark:text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
