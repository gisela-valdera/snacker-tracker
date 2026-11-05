import React, { useState, useEffect, useRef } from 'react';
import { SnackCategory } from '../types.ts';

interface EmptyStateProps {
  mode: 'inaugural' | 'filtered';
  onOpenAddModal: () => void;
  searchQuery?: string;
  currentFilter?: SnackCategory;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  mode,
  onOpenAddModal,
  searchQuery = '',
  currentFilter = 'all',
  onResetFilters,
}) => {
  const [hungerPangsActive, setHungerPangsActive] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(true); // Requirement: muted by default!
  const hasTriggeredRef = useRef(false);

  // Play synthesized low-frequency stomach rumble via Web Audio API
  const playStomachRumble = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(48, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(34, ctx.currentTime + 1.3);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(62, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(40, ctx.currentTime + 1.3);

      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.6);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.45);
      osc2.stop(ctx.currentTime + 1.45);
    } catch (e) {
      console.warn('Audio rumble not supported:', e);
    }
  };

  // 10-second timer on empty list
  useEffect(() => {
    const timer = setTimeout(() => {
      setHungerPangsActive(true);
      if (!hasTriggeredRef.current && !isSoundMuted) {
        hasTriggeredRef.current = true;
        playStomachRumble();
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isSoundMuted, mode]);

  const handleToggleSound = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    if (!nextMuted) {
      playStomachRumble();
    }
  };

  // Render Hunger Pangs speech bubble
  const renderHungerPangsBubble = () => {
    if (!hungerPangsActive) return null;

    return (
      <div className="my-6 border-2 border-[var(--border-color)] bg-[var(--bg)] p-4 sm:p-5 shadow-[5px_5px_0px_var(--border-color)] text-left font-mono-tabular relative animate-fadeIn max-w-xl mx-auto">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-amber-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Hunger Pangs // Page Stomach Rumble
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            title={isSoundMuted ? 'Unmute stomach sound' : 'Mute stomach sound'}
            className="text-[11px] uppercase font-bold px-2 py-0.5 border border-[var(--border-color)] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors cursor-pointer"
          >
            {isSoundMuted ? '🔇 Sound (Muted)' : '🔊 Sound (Active)'}
          </button>
        </div>

        <div className="flex items-start gap-3 mt-3">
          <div className="text-2xl select-none rumble-shake">🍽️</div>
          <div className="flex-1">
            <div className="font-black text-base sm:text-lg tracking-tight uppercase rumble-shake inline-block">
              *grrrrr... rrrrumble!*
            </div>
            <p className="text-xs sm:text-sm opacity-85 mt-1 leading-relaxed">
              You have been staring at an empty list for 10 seconds and the department stomach is growling! The team needs emergency provisions.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="text-xs font-bold uppercase underline hover:opacity-75 cursor-pointer"
              >
                + Silence the rumbling (Add Snack) →
              </button>
              {!isSoundMuted && (
                <button
                  type="button"
                  onClick={playStomachRumble}
                  className="text-[11px] opacity-75 hover:opacity-100 underline cursor-pointer"
                >
                  [Replay rumble]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (mode === 'filtered') {
    return (
      <div className="border border-[var(--border-color)] bg-[var(--card-bg)] p-8 sm:p-12 text-center my-6">
        <div className="font-mono-tabular text-xs uppercase tracking-widest opacity-60 mb-3">
          Filter Search // Zero Matches
        </div>
        <h3 className="text-2xl sm:text-3xl font-black uppercase mb-3 tracking-tight">
          No snacks matched this filter
        </h3>
        <p className="text-base sm:text-lg max-w-lg mx-auto opacity-80 mb-6 leading-relaxed">
          {searchQuery ? (
            <>
              No items currently match &ldquo;<span className="font-bold underline">{searchQuery}</span>&rdquo;
              {currentFilter !== 'all' ? ` in category [${currentFilter}].` : '.'}
            </>
          ) : (
            `No snacks are currently filed under [${currentFilter}].`
          )}
        </p>

        {renderHungerPangsBubble()}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              type="button"
              className="brutalist-btn text-xs font-mono-tabular"
            >
              [↺ Clear Filters]
            </button>
          )}
          <button
            onClick={onOpenAddModal}
            type="button"
            className="brutalist-btn-outline text-xs font-mono-tabular"
          >
            + Add New Entry Instead
          </button>
        </div>
      </div>
    );
  }

  // Inaugural Empty State (Entire archive has 0 snacks)
  return (
    <div className="border-2 border-[var(--border-color)] bg-[var(--card-bg)] p-8 sm:p-16 my-6 relative overflow-hidden">
      {/* Decorative architectural watermarks */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-8 text-xs font-mono-tabular">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--fg)] inline-block" />
          <span className="font-bold uppercase tracking-wider">
            Curatorial Registry // Status: Ready for Inauguration
          </span>
        </div>
        <span className="opacity-60 hidden sm:inline">Archive Accession S01 Awaiting</span>
      </div>

      <div className="max-w-2xl">
        <div className="inline-block border border-[var(--border-color)] px-2 py-0.5 text-[11px] font-mono-tabular uppercase tracking-wider mb-4 opacity-80">
          Inaugural Entry Open
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-5">
          The department pantry is empty. Be the first to bring it to life.
        </h2>

        <p className="text-base sm:text-lg opacity-85 leading-relaxed mb-8">
          No snacks have been catalogued yet, which means the very first entry in the studio archive is yours to claim! Whether it is an artisanal treat brought back from travels, a curious corner-store crisp flavour, or everyday team fuel, introduce your colleagues to something memorable.
        </p>

        {renderHungerPangsBubble()}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
          <button
            onClick={onOpenAddModal}
            type="button"
            className="brutalist-btn text-sm sm:text-base py-3 px-6 cursor-pointer"
          >
            + Log The Inaugural Snack
          </button>
          <span className="text-xs font-mono-tabular opacity-60 self-center">
            No sign-in required · Instant community rating
          </span>
        </div>
      </div>

      {/* Three friendly guidance pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[var(--border-subtle)] text-xs font-mono-tabular">
        <div className="space-y-1">
          <span className="font-bold opacity-60 uppercase block">01 // Quick Logging</span>
          <p className="opacity-80">Takes under 60 seconds. Name, contributor, origin and optional tasting notes.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold opacity-60 uppercase block">02 // Open Community</span>
          <p className="opacity-80">Public to anyone with the link. No accounts, sign-ins, or passwords needed.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold opacity-60 uppercase block">03 // 5-Star Reviews</span>
          <p className="opacity-80">Teammates can vote in 0.5-star increments and build the all-time studio leaderboard.</p>
        </div>
      </div>
    </div>
  );
};
