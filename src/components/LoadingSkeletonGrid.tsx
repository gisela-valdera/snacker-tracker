import React from 'react';
import { ViewMode } from '../types.ts';

interface LoadingSkeletonGridProps {
  viewMode?: ViewMode;
}

export const LoadingSkeletonGrid: React.FC<LoadingSkeletonGridProps> = ({ viewMode = 'index' }) => {
  return (
    <div className="w-full space-y-6 pt-2" aria-busy="true" aria-label="Loading archive records">
      {/* Editorial Status Ribbon */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[12px] font-mono-tabular opacity-70">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[var(--fg)] animate-ping" />
          <span className="uppercase tracking-wider font-bold">Connecting to Cloud Archive</span>
        </div>
        <span className="hidden sm:inline opacity-60">Syncing live catalog entries...</span>
      </div>

      {viewMode === 'index' ? (
        /* List Skeletons */
        <div className="space-y-0 border-b border-[var(--border-color)]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="py-4 px-3 border-t border-[var(--border-subtle)] grid grid-cols-[36px_1.4fr_180px] md:grid-cols-[44px_1.8fr_100px_1fr_200px] lg:grid-cols-[50px_2fr_110px_1.1fr_1fr_220px] items-center gap-4 animate-pulse"
            >
              {/* Ref placeholder */}
              <div className="h-4 bg-[var(--fg)]/15 w-7" />

              {/* Title & Category placeholder */}
              <div className="space-y-2">
                <div
                  className="h-5 bg-[var(--fg)]/20"
                  style={{ width: `${Math.min(95, 45 + (i * 11) % 45)}%` }}
                />
                <div className="h-3 bg-[var(--fg)]/10 w-24" />
              </div>

              {/* Date placeholder */}
              <div className="hidden md:block">
                <div className="h-4 bg-[var(--fg)]/15 w-20" />
              </div>

              {/* Provenance placeholder */}
              <div className="hidden md:block">
                <div className="h-4 bg-[var(--fg)]/15 w-24" />
              </div>

              {/* Contributor placeholder */}
              <div className="hidden lg:block">
                <div className="h-4 bg-[var(--fg)]/15 w-20" />
              </div>

              {/* Stars placeholder */}
              <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-3.5 h-3.5 border border-[var(--border-subtle)] bg-[var(--fg)]/10" />
                  ))}
                </div>
                <div className="h-3 bg-[var(--fg)]/15 w-10 ml-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Gallery Skeleton Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col justify-between p-5 space-y-5 animate-pulse"
            >
              {/* Top Bar placeholder */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <div className="h-4 bg-[var(--fg)]/15 w-12" />
                <div className="h-4 bg-[var(--fg)]/10 w-20" />
              </div>

              {/* Poster block placeholder */}
              <div className="bg-[var(--card-poster-bg)] h-32 flex flex-col justify-end p-4 border border-[var(--border-subtle)]">
                <div className="h-6 bg-[var(--fg)]/20 w-3/4 mb-2" />
                <div className="h-4 bg-[var(--fg)]/15 w-1/2" />
              </div>

              {/* Metadata row placeholder */}
              <div className="space-y-2 font-mono-tabular text-xs">
                <div className="flex justify-between">
                  <div className="h-3 bg-[var(--fg)]/10 w-20" />
                  <div className="h-3 bg-[var(--fg)]/15 w-24" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-[var(--fg)]/10 w-16" />
                  <div className="h-3 bg-[var(--fg)]/15 w-28" />
                </div>
              </div>

              {/* Footer Star Bar */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-3.5 h-3.5 border border-[var(--border-subtle)] bg-[var(--fg)]/10" />
                  ))}
                </div>
                <div className="h-3 bg-[var(--fg)]/15 w-14" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
