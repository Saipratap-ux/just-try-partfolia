import React from 'react';
import { ArrowUp } from 'lucide-react';
import { DEVELOPER_IDENTITY } from '../data/portfolioData';
import { audioEngine } from '../utils/audioEngine';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    audioEngine.playTransition();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#050814]/95 pb-28 sm:pb-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-display text-base font-bold text-slate-900 dark:text-white">
            SAIPRATAP
          </span>
          <span className="hidden sm:inline text-slate-400" aria-hidden="true">·</span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} {DEVELOPER_IDENTITY.name}. Built with Three.js &amp; TypeScript.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Projects
          </button>
          <a
            href={DEVELOPER_IDENTITY.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href={`mailto:${DEVELOPER_IDENTITY.email}`}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Email
          </a>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-blue-500 dark:hover:border-cyan-400 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
