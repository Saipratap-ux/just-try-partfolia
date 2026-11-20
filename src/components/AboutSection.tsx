import React, { useState } from 'react';
import { Code2, Compass, Globe, Sparkles } from 'lucide-react';
import { DEVELOPER_IDENTITY } from '../data/portfolioData';

export const AboutSection: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="about"
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-slate-800/70"
    >
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          01. About Me
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Aspiring Developer &amp; Digital Creator
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Visual Column */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="relative flex-1 min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
            {!imgError ? (
              <img
                src={DEVELOPER_IDENTITY.workspaceImage}
                alt="Saipratap Dansana software development studio setup"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0B1124] via-[#111c3d] to-[#1e1b4b] text-center">
                <Code2 className="w-10 h-10 text-cyan-400 mb-3" />
                <p className="font-display text-lg font-semibold text-white">
                  Saipratap Dansana
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Web · 3D · Kotlin · AI Experiments
                </p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5">
              <p className="text-sm font-semibold text-white">
                Saipratap Dansana
              </p>
              <p className="text-xs text-slate-200 mt-0.5">
                Building interactive web, 3D, and Android applications
              </p>
            </div>
          </div>
        </div>

        {/* Right Narrative & Profile Facts */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-7 sm:p-9">
          <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            <p>
              I am an aspiring software developer and digital creator passionate about turning
              curious ideas into interactive software. Across my public GitHub repositories, I
              explore diverse domains—from 3D educational websites and browser games to
              Android/Kotlin applications powered by AI and multilingual support.
            </p>
            <p>
              Rather than limiting myself to a single stack, I enjoy learning by shipping real
              projects: building <strong className="text-slate-900 dark:text-white">EduVerse 3D</strong> to
              bring visual depth to learning, crafting <strong className="text-slate-900 dark:text-white">StudentHub</strong> in
              TypeScript for academic productivity, and experimenting with practical tools like{' '}
              <strong className="text-slate-900 dark:text-white">Tree Health Checking</strong>.
            </p>
            <p>
              My goal is to keep growing as a full-spectrum builder—combining clean engineering
              fundamentals, thoughtful user interfaces, and immersive 3D web technology.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Core Direction
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  3D Web, Mobile &amp; AI
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Location
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {DEVELOPER_IDENTITY.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Learning Mindset
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  Build, Test &amp; Iterate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
