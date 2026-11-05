import React from 'react';
import { ViewMode, ThemeMode } from '../types.ts';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  itemCount: number;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  resolvedIsDark: boolean;
  onTableBump?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenAddModal,
  itemCount,
  theme,
  onThemeChange,
  resolvedIsDark,
  onTableBump,
}) => {
  const [logoClicks, setLogoClicks] = React.useState(0);
  const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 3) {
      if (onTableBump) onTableBump();
      setLogoClicks(0);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      return;
    }

    setLogoClicks(next);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 1200);
  };

  return (
    <header className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[var(--border-color)] pb-3 mb-10 text-[13px] md:text-[14px] font-medium tracking-tight">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogoClick}
          title="Snack Tracker (Tip: click 3 times to bump the table)"
          className="font-bold tracking-tighter uppercase text-[15px] cursor-pointer bg-transparent border-0 text-inherit text-left p-0 select-none hover:opacity-80 active:scale-95 transition-transform"
        >
          Snack Tracker
        </button>
        <span className="text-[12px] opacity-60 font-mono-tabular">[{itemCount}]</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setViewMode('index')}
          className={`hover:bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit transition-colors ${
            viewMode === 'index' ? 'font-bold underline' : 'opacity-75'
          }`}
        >
          Index
        </button>
        <span className="opacity-40">/</span>
        <button
          onClick={onOpenAddModal}
          className="hover:bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit font-bold uppercase transition-colors"
        >
          + Add
        </button>
        <span className="opacity-40">/</span>
        <button
          onClick={() => setViewMode('stats')}
          className={`hover:bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit transition-colors ${
            viewMode === 'stats' ? 'font-bold underline' : 'opacity-75'
          }`}
        >
          Stats
        </button>
        <span className="opacity-40">/</span>
        <button
          onClick={() => setViewMode('about')}
          className={`hover:bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit transition-colors ${
            viewMode === 'about' ? 'font-bold underline' : 'opacity-75'
          }`}
        >
          About
        </button>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => setViewMode(viewMode === 'gallery' ? 'index' : 'gallery')}
          className="filter-btn text-[13px] uppercase font-bold tracking-tight"
        >
          {viewMode === 'gallery' ? '[List View]' : '[Gallery View]'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 text-right text-[12px] md:text-[13px] opacity-90 font-mono-tabular">
        <span className="opacity-75 hidden lg:inline">X-Team, VML UK ©2026</span>
        <div
          className="inline-flex items-center border border-[var(--border-color)] text-[11px] font-mono-tabular select-none"
          role="group"
          aria-label="Color theme"
        >
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            aria-pressed={theme === 'light'}
            title="Light mode"
            className={`px-1.5 py-0.5 cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-bold'
                : 'bg-transparent text-[var(--fg)] hover:bg-[var(--bg-hover)] opacity-70 hover:opacity-100'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            aria-pressed={theme === 'dark'}
            title="Dark mode"
            className={`px-1.5 py-0.5 border-l border-[var(--border-color)] cursor-pointer transition-colors ${
              theme === 'dark'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-bold'
                : 'bg-transparent text-[var(--fg)] hover:bg-[var(--bg-hover)] opacity-70 hover:opacity-100'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('system')}
            aria-pressed={theme === 'system'}
            title={`Auto system setting (currently ${resolvedIsDark ? 'Dark' : 'Light'})`}
            className={`px-1.5 py-0.5 border-l border-[var(--border-color)] cursor-pointer transition-colors ${
              theme === 'system'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-bold'
                : 'bg-transparent text-[var(--fg)] hover:bg-[var(--bg-hover)] opacity-70 hover:opacity-100'
            }`}
          >
            Auto
          </button>
        </div>
      </div>
    </header>
  );
};

