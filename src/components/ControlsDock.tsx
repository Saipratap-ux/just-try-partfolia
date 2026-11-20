import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Moon,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { AudioSettings } from '../types/portfolio';

interface ControlsDockProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  orbitEnabled: boolean;
  onToggleOrbit: () => void;
  onResetCamera: () => void;
}

export const ControlsDock: React.FC<ControlsDockProps> = ({
  theme,
  onToggleTheme,
  orbitEnabled,
  onToggleOrbit,
  onResetCamera,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [audio, setAudio] = useState<AudioSettings>(audioEngine.getSettings());
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    return audioEngine.subscribe(setAudio);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center max-w-[94vw]">
        <button
          type="button"
          onClick={() => {
            audioEngine.playClick();
            setCollapsed((prev) => !prev);
          }}
          className="mb-1.5 inline-flex items-center gap-1.5 rounded-t-lg border border-slate-300 dark:border-slate-700/80 bg-white/95 dark:bg-[#0B1124]/95 px-3 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors whitespace-nowrap"
          aria-label={collapsed ? 'Show Experience Controls' : 'Hide Experience Controls'}
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{collapsed ? 'Controls' : 'Hide Controls'}</span>
        </button>

        {!collapsed && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white/95 dark:bg-[#0B1124]/95 px-3.5 py-2 shadow-xl">
            {/* Ambient Soundtrack Play/Pause */}
            <button
              type="button"
              onClick={() => void audioEngine.toggleMusic()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                audio.musicPlaying
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Toggle ambient cosmic soundtrack"
            >
              {audio.musicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{audio.musicPlaying ? 'Pause Music' : 'Play Music'}</span>
            </button>

            {/* Interactive Sound Effects Toggle */}
            <button
              type="button"
              onClick={() => audioEngine.toggleSfx()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                audio.sfxEnabled
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Toggle button and hover sound effects"
            >
              <span>SFX {audio.sfxEnabled ? 'On' : 'Off'}</span>
            </button>

            {/* Mute & Volume */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
              <button
                type="button"
                aria-label={audio.muted ? 'Unmute audio' : 'Mute audio'}
                onClick={() => audioEngine.toggleMute()}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={audio.muted ? 'Unmute' : 'Mute'}
              >
                {audio.muted || audio.volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-500" />
                )}
              </button>
              <input
                type="range"
                aria-label="Audio volume"
                min={0}
                max={1}
                step={0.05}
                value={audio.muted ? 0 : audio.volume}
                onChange={(e) => audioEngine.setVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-20 accent-blue-500 cursor-pointer"
              />
            </div>

            {/* 3D Orbit Toggle & Reset */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick();
                  onToggleOrbit();
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  orbitEnabled
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Drag to orbit the 3D scene"
              >
                <Orbit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{orbitEnabled ? '3D Orbit On' : '3D Orbit'}</span>
              </button>

              {orbitEnabled && (
                <button
                  type="button"
                  aria-label="Reset 3D camera"
                  onClick={() => {
                    audioEngine.playClick();
                    onResetCamera();
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Reset 3D view"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Theme Switch */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onToggleTheme();
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* In-App PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick();
                  void install();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {!isInstalled && !isInstallable && isIOS && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick();
                  setShowIOSGuide(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
          </div>
        )}
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1124] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Install SAIPRATAP on iOS
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in the Safari toolbar.
              <br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
