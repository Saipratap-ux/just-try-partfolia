import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  GitFork,
  RefreshCw,
  Search,
  Star,
  X,
} from 'lucide-react';
import { FEATURED_PROJECTS } from '../data/portfolioData';
import type { FeaturedProject, GitHubRepo } from '../types/portfolio';
import { audioEngine } from '../utils/audioEngine';

interface ProjectsSectionProps {
  repos: GitHubRepo[];
  loading: boolean;
  isLive: boolean;
  errorMessage: string | null;
  onRefresh: () => void;
}

type SortOption = 'updated' | 'stars' | 'name';

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  repos,
  loading,
  isLive,
  errorMessage,
  onRefresh,
}) => {
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [tiltId, setTiltId] = useState<string | null>(null);
  const [tiltTransform, setTiltTransform] = useState<string>('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedProject]);

  // Merge live repo metadata (stars, forks, updated_at) into curated Featured Projects
  const enrichedFeatured = useMemo(() => {
    const repoMap = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
    return FEATURED_PROJECTS.map((proj) => {
      const live = repoMap.get(proj.repoName.toLowerCase());
      return {
        ...proj,
        stars: live?.stargazers_count ?? 0,
        forks: live?.forks_count ?? 0,
        updatedAt: live?.updated_at ?? null,
        liveDemoUrl: proj.demoUrl || (live?.homepage && live.homepage.startsWith('http') ? live.homepage : undefined),
      };
    });
  }, [repos]);

  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return ['All', ...Array.from(langs)];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = repos.filter((repo) => {
      const matchesLang = languageFilter === 'All' || repo.language === languageFilter;
      const matchesQuery =
        !q ||
        repo.name.toLowerCase().includes(q) ||
        (repo.description || '').toLowerCase().includes(q) ||
        (repo.language || '').toLowerCase().includes(q);
      return matchesLang && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [repos, searchQuery, languageFilter, sortBy]);

  const handleCardPointerMove = (e: React.PointerEvent<HTMLElement>, id: string) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltId(id);
    setTiltTransform(`perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`);
  };

  const resetCardTilt = () => {
    setTiltId(null);
    setTiltTransform('');
  };

  return (
    <section
      id="projects"
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-slate-800/70"
    >
      {/* Curated Featured Showcase */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
          03. Featured Works
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Curated Digital &amp; Engineering Projects
        </h2>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Highlighted builds across Android/Kotlin AI, 3D web experiences, student platforms, and browser tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedFeatured.map((project) => (
          <article
            key={project.id}
            onPointerMove={(e) => handleCardPointerMove(e, project.id)}
            onPointerLeave={resetCardTilt}
            onMouseEnter={() => audioEngine.playHover()}
            style={{
              transform: tiltId === project.id ? tiltTransform : 'none',
              transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 shadow-sm hover:border-blue-500/60 dark:hover:border-cyan-400/60"
          >
            {/* Preview Visual or Styled Fallback Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              {project.imageUrl && !brokenImages[project.id] ? (
                <img
                  src={project.imageUrl}
                  alt={`${project.title} preview`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, [project.id]: true }))
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full flex flex-col justify-between p-6"
                  style={{
                    background: `radial-gradient(circle at 80% 20%, ${project.accentColor}33, transparent 58%), linear-gradient(135deg, #070d1f 0%, #0f172a 100%)`,
                  }}
                >
                  <Code2 className="w-7 h-7 text-cyan-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-300">{project.category}</p>
                    <p className="font-display text-lg font-bold text-white mt-1">
                      {project.title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
                  {project.category}
                </p>
                <h3 className="mt-1.5 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {project.title}
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {project.summary}
                </p>

                {/* Unboxed metadata stack */}
                <p className="mt-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                  {project.stack.join(' · ')}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => audioEngine.playClick()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap"
                  >
                    <span>Source Code</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => audioEngine.playClick()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline whitespace-nowrap"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playTransition();
                    setSelectedProject(project);
                  }}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Live GitHub Repository Explorer */}
      <div className="mt-20 pt-14 border-t border-slate-200/80 dark:border-slate-800/70">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Live GitHub Explorer
            </p>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              All Public Repositories (@Saipratap-ux)
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              {isLive
                ? `Showing ${repos.length} live repositories retrieved from the GitHub REST API.`
                : errorMessage || `Showing ${repos.length} verified repositories.`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.playClick();
              onRefresh();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start lg:self-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1124] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Refresh GitHub'}</span>
          </button>
        </div>

        {/* Search, Language Filter & Sort Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories by name or tech..."
              aria-label="Search GitHub repositories"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B1124] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Filter repositories by language"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B1124] p-1"
            >
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    audioEngine.playClick();
                    setLanguageFilter(lang);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    languageFilter === lang
                      ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <select
              aria-label="Sort repositories"
              value={sortBy}
              onChange={(e) => {
                audioEngine.playClick();
                setSortBy(e.target.value as SortOption);
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0B1124] px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="updated">Sort: Recently Updated</option>
              <option value="stars">Sort: Most Stars</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Repository List */}
        {filteredRepos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-10 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No repositories match your current search or language filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLanguageFilter('All');
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => {
              const hasLiveDemo = repo.homepage && repo.homepage.startsWith('http');
              return (
                <div
                  key={repo.id}
                  onMouseEnter={() => audioEngine.playHover()}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1124]/92 p-5 hover:border-blue-500/60 dark:hover:border-cyan-400/60 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-base font-bold text-slate-900 dark:text-white break-words">
                        {repo.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        <span className="inline-flex items-center gap-1" title="Stars">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          {repo.stargazers_count}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Forks">
                          <GitFork className="w-3.5 h-3.5 text-slate-400" />
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {repo.description || 'Public software experiment hosted on GitHub.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>{repo.language || 'Code'}</span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {formatRelativeDate(repo.updated_at)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasLiveDemo && (
                        <a
                          href={repo.homepage!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => audioEngine.playClick()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline whitespace-nowrap"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => audioEngine.playClick()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap"
                      >
                        <span>Source Code</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1124] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close project details"
              onClick={() => {
                audioEngine.playClick();
                setSelectedProject(null);
              }}
              className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedProject.imageUrl && !brokenImages[selectedProject.id] && (
              <div className="aspect-[16/9] w-full bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
                {selectedProject.category}
              </p>
              <h3
                id="modal-project-title"
                className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white"
              >
                {selectedProject.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedProject.summary}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {selectedProject.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {selectedProject.stack.join(' · ')}
                </span>

                <div className="flex items-center gap-3">
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <span>Open Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href={selectedProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    <span>View Repository</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
