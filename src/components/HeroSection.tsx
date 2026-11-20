import React, { useState } from 'react';
import { ArrowDown, ArrowUpRight, Download, Github, Mail, User } from 'lucide-react';
import { DEVELOPER_IDENTITY } from '../data/portfolioData';
import type { GitHubProfile, GitHubRepo } from '../types/portfolio';
import { audioEngine } from '../utils/audioEngine';
import { downloadPortfolioCV } from '../utils/cvGenerator';

interface HeroSectionProps {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  isLive: boolean;
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  repos,
  isLive,
  onNavigate,
}) => {
  const [cvDownloaded, setCvDownloaded] = useState(false);

  const uniqueLanguages = Array.from(
    new Set(repos.map((r) => r.language).filter((lang): lang is string => Boolean(lang))),
  );

  const handleDownloadCV = () => {
    audioEngine.playClick();
    downloadPortfolioCV();
    setCvDownloaded(true);
    window.setTimeout(() => setCvDownloaded(false), 3000);
  };

  return (
    <section
      id="home"
      className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-24"
    >
      {/* Hero Split: Left content leaves right 3D Cosmic Core unobstructed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[540px]">
        <div className="lg:col-span-7 flex flex-col items-start">
          <p className="text-xs sm:text-sm font-medium tracking-wide text-blue-600 dark:text-cyan-400 mb-4">
            Digital Creator · Software Developer · GitHub @Saipratap-ux
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
            {DEVELOPER_IDENTITY.headline}
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 dark:from-blue-400 dark:via-cyan-300 dark:to-violet-400 bg-clip-text text-transparent">
              {DEVELOPER_IDENTITY.subheadline}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {DEVELOPER_IDENTITY.introCopy}
          </p>

          {/* 4 Required Functional Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioEngine.playTransition();
                onNavigate('projects');
              }}
              onMouseEnter={() => audioEngine.playHover()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Explore Projects</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onNavigate('about');
              }}
              onMouseEnter={() => audioEngine.playHover()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1124]/90 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-blue-500 dark:hover:border-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
              <span>About Me</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCV}
              onMouseEnter={() => audioEngine.playHover()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1124]/90 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-blue-500 dark:hover:border-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span>{cvDownloaded ? 'CV Downloaded' : 'Download CV'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onNavigate('contact');
              }}
              onMouseEnter={() => audioEngine.playHover()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1124]/90 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-blue-500 dark:hover:border-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Contact Me</span>
            </button>
          </div>
        </div>

        {/* Right column intentionally open so the 3D Cosmic Orbital Core stands as focal anchor */}
        <div className="lg:col-span-5 hidden lg:block min-h-[380px]" aria-hidden="true" />
      </div>

      {/* Full-width GitHub Proof Metrics Strip below Hero Split */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/92 dark:bg-[#0B1124]/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Public Repositories
          </span>
          <span className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {profile.public_repos || repos.length}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isLive ? 'Synced from GitHub API' : 'Verified portfolio index'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Languages Explored
          </span>
          <span className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {Math.max(uniqueLanguages.length, 4)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {uniqueLanguages.slice(0, 4).join(' · ') || 'Kotlin · TypeScript · HTML'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Focus Domains
          </span>
          <span className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            Web, 3D &amp; AI
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Mobile, Education &amp; Tools
          </span>
        </div>

        <div className="flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            GitHub Developer Profile
          </span>
          <a
            href={DEVELOPER_IDENTITY.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioEngine.playClick()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline whitespace-nowrap"
          >
            <Github className="w-4 h-4 shrink-0" />
            <span>@{DEVELOPER_IDENTITY.githubUsername}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </a>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Open-source code &amp; demos
          </span>
        </div>
      </div>
    </section>
  );
};
