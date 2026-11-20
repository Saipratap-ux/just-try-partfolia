import React, { useState } from 'react';
import { SKILLS_DATA } from '../data/portfolioData';
import type { SkillCategory } from '../types/portfolio';
import { audioEngine } from '../utils/audioEngine';

const CATEGORIES: { id: SkillCategory; label: string }[] = [
  { id: 'all', label: 'All Skills' },
  { id: 'frontend', label: 'Frontend & 3D' },
  { id: 'mobile', label: 'Mobile & AI' },
  { id: 'tools', label: 'Web & Tooling' },
];

export const SkillsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('all');

  const filteredSkills =
    activeCategory === 'all'
      ? SKILLS_DATA
      : SKILLS_DATA.filter((skill) => skill.category === activeCategory);

  return (
    <section
      id="skills"
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-slate-800/70"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            02. Skills &amp; Technologies
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Verified Stack &amp; Capabilities
          </h2>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Technologies actively used across my GitHub repositories, web deployments, and Android experiments.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter skills by category"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#0B1124]/95 p-1"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              type="button"
              onClick={() => {
                audioEngine.playClick();
                setActiveCategory(cat.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map((skill) => (
          <div
            key={skill.name}
            onMouseEnter={() => audioEngine.playHover()}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-6 transition-transform duration-200 hover:-translate-y-1 hover:border-blue-400/70 dark:hover:border-cyan-500/60"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {skill.name}
              </h3>
              <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                {skill.level}%
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {skill.focus}
            </p>

            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${skill.level}%`,
                  background: `linear-gradient(90deg, ${skill.accent}, #06B6D4)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
