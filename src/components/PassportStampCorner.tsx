import React, { useState } from 'react';

interface PassportStampCornerProps {
  stampsCount: number;
  latestStamp: { country: string; date: string } | null;
  allStampedCountries: string[];
  isRecentlyStamped: boolean;
  onClearRecent?: () => void;
}

export const PassportStampCorner: React.FC<PassportStampCornerProps> = ({
  stampsCount,
  latestStamp,
  allStampedCountries,
  isRecentlyStamped,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (stampsCount === 0 && !latestStamp) {
    return null;
  }

  const displayCountry = latestStamp?.country || (allStampedCountries.length > 0 ? allStampedCountries[allStampedCountries.length - 1] : 'ORIGIN');
  const displayDate = latestStamp?.date || new Date().toLocaleDateString('en-GB');

  return (
    <aside
      aria-label="Passport Stamp Collection"
      className="fixed bottom-4 left-4 z-40 select-none print:hidden"
    >
      {/* Expanded Passport Ledger Drawer */}
      {isOpen && (
        <div className="mb-2 w-72 sm:w-80 border-2 border-[var(--border-color)] bg-[var(--bg)] p-4 shadow-[6px_6px_0px_var(--border-color)] font-mono-tabular text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-3">
            <div className="font-bold uppercase tracking-wider text-[11px]">
              Passport Stamp Book // Entry Log
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:underline font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] opacity-75 mb-3 leading-snug">
            Each snack submitted from a newly discovered sovereign territory earns a permanent ink stamp in the department passport.
          </div>

          <div className="border border-[var(--border-subtle)] max-h-48 overflow-y-auto p-2 bg-[var(--card-bg)] space-y-1.5">
            {allStampedCountries.map((c, i) => (
              <div
                key={c}
                className="flex items-center justify-between py-1 px-1.5 border-b border-[var(--border-subtle)] last:border-0"
              >
                <span className="font-bold text-[11px]">
                  <span className="opacity-50 mr-1.5">#{String(i + 1).padStart(2, '0')}</span>
                  {c.toUpperCase()}
                </span>
                <span className="text-[10px] opacity-60 uppercase">Verified Entry</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex justify-between items-center text-[11px]">
            <span className="font-bold">Total Stamps: {stampsCount}</span>
            <span className="opacity-60 text-[10px]">X-Team / VML UK</span>
          </div>
        </div>
      )}

      {/* Main Corner Passport Ink Stamp Badge */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        title="Click to view all collected passport stamps"
        className={`cursor-pointer transition-transform duration-200 hover:scale-105 ${
          isRecentlyStamped ? 'animate-stamp-slam' : ''
        }`}
      >
        <div className="passport-stamp-seal p-2.5 px-3 max-w-[220px] rounded-sm transform -rotate-3 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between gap-2 border-b border-dashed border-current pb-1 mb-1 text-[9px] uppercase tracking-wider font-bold">
            <span>★ PASSPORT CONTROL ★</span>
            <span className="bg-red-700 text-white dark:bg-red-600 px-1 text-[8px] font-mono-tabular">
              #{stampsCount}
            </span>
          </div>

          <div className="text-center my-0.5">
            <div className="text-[13px] font-black uppercase tracking-tight leading-tight truncate">
              {displayCountry}
            </div>
            <div className="text-[9px] opacity-80 uppercase tracking-widest">
              NEW TERRITORY ENTRY
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-current pt-1 mt-1 text-[8px] opacity-90">
            <span>{displayDate}</span>
            <span className="font-bold underline">
              {stampsCount} STAMP{stampsCount === 1 ? '' : 'S'} [VIEW]
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
