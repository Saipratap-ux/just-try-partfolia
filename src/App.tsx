import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ControlsDock } from './components/ControlsDock';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { HeroUniverseCanvas } from './components/HeroUniverseCanvas';
import { JourneySection } from './components/JourneySection';
import { LoadingIntro } from './components/LoadingIntro';
import { Navbar } from './components/Navbar';
import { NotFoundView } from './components/NotFoundView';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { useGitHubData } from './hooks/useGitHubData';
import { useOnlineStatus } from './hooks/useOnlineStatus';

gsap.registerPlugin(ScrollTrigger);

const THEME_STORAGE_KEY = 'saipratap_theme_v1';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });
  const [orbitEnabled, setOrbitEnabled] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [isNotFound, setIsNotFound] = useState(() => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname;
    return p !== '/' && p !== '/index.html' && !p.startsWith('/#');
  });

  const mainRef = useRef<HTMLDivElement | null>(null);
  const { profile, repos, loading, isLive, errorMessage, refresh } = useGitHubData();
  const isOnline = useOnlineStatus();

  // Sync Tailwind .dark class and theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage error
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#050814' : '#F8FAFC');
    }
  }, [theme]);

  // GSAP subtle entrance & scroll reveal (respects prefers-reduced-motion)
  useEffect(() => {
    if (!introDone || isNotFound || !mainRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('main section');
      sections.slice(1).forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0.25, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 86%',
              once: true,
            },
          },
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, [introDone, isNotFound]);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      if (isNotFound) {
        window.history.pushState({}, '', '/');
        setIsNotFound(false);
        window.setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
        return;
      }
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    },
    [isNotFound],
  );

  const handleReturnHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    setIsNotFound(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div
      ref={mainRef}
      className="relative min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#050814] dark:text-slate-100 transition-colors duration-300"
    >
      {/* Loading Reveal */}
      <LoadingIntro onComplete={() => setIntroDone(true)} />

      {/* 3D Digital Universe Background */}
      <HeroUniverseCanvas
        theme={theme}
        orbitEnabled={orbitEnabled}
        resetCounter={resetCounter}
      />

      {/* Offline Resilience Banner */}
      {!isOnline && (
        <div
          role="status"
          className="fixed top-16 right-4 z-50 rounded-lg border border-amber-500/40 bg-amber-500/95 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg"
        >
          Offline Mode — Cached portfolio data active
        </div>
      )}

      {/* Top Navigation */}
      <Navbar onNavigate={handleNavigate} />

      {/* Main Content */}
      {isNotFound ? (
        <NotFoundView onReturnHome={handleReturnHome} />
      ) : (
        <main>
          <HeroSection
            profile={profile}
            repos={repos}
            isLive={isLive}
            onNavigate={handleNavigate}
          />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection
            repos={repos}
            loading={loading}
            isLive={isLive}
            errorMessage={errorMessage}
            onRefresh={refresh}
          />
          <JourneySection />
          <ContactSection />
        </main>
      )}

      <Footer onNavigate={handleNavigate} />

      {/* Unified Collapsible Bottom Experience Controls */}
      <ControlsDock
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        orbitEnabled={orbitEnabled}
        onToggleOrbit={() => setOrbitEnabled((prev) => !prev)}
        onResetCamera={() => setResetCounter((c) => c + 1)}
      />
    </div>
  );
}
