import React from 'react';
import { Snack } from '../types.ts';
import { StarRating } from './StarRating.tsx';
import { EmptyState } from './EmptyState.tsx';

interface SnackGalleryViewProps {
  snacks: Snack[];
  onSelectSnack: (snack: Snack) => void;
  onOpenAddModal: () => void;
  userRatings: Record<string, number>;
  onRateSnack: (snackId: string, rating: number) => Promise<void>;
  legendarySnackIds?: Set<string>;
  isTableBumped?: boolean;
}

export const SnackGalleryView: React.FC<SnackGalleryViewProps> = ({
  snacks,
  onSelectSnack,
  onOpenAddModal,
  userRatings,
  onRateSnack,
  legendarySnackIds = new Set(),
  isTableBumped = false,
}) => {
  const formatDateDDMMYYYY = (dateStr?: string): string => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return `${dd}/${mm}/${yyyy}`;
    }
    return dateStr;
  };

  if (snacks.length === 0) {
    return <EmptyState mode="inaugural" onOpenAddModal={onOpenAddModal} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
      {snacks.map((snack, idx) => {
        const indexCode = `S${String(idx + 1).padStart(2, '0')}`;
        const userRating = userRatings[snack.id] ?? null;
        const isLegendary =
          legendarySnackIds.has(snack.id) ||
          ((snack.ratingCount ?? 0) >= 2 &&
            (snack.ratingSum ?? 0) / (snack.ratingCount ?? 1) === 5);
        
        return (
          <article
            key={snack.id}
            onClick={() => onSelectSnack(snack)}
            style={{
              animationDelay: isTableBumped ? `${(idx % 12) * 40}ms` : undefined,
            }}
            className={`border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col justify-between cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-[var(--card-shadow)] group relative overflow-hidden ${
              isLegendary ? 'legendary-gold-shimmer' : ''
            } ${isTableBumped ? 'table-bump-wobble' : ''}`}
          >
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] font-mono-tabular text-[12px] bg-[var(--fg)]/5 group-hover:bg-[var(--bg-hover)] group-hover:text-[var(--fg)] transition-colors">
              <span className="font-bold flex items-center gap-1.5">
                {indexCode} // {snack.origin.toUpperCase()}
                {isLegendary && (
                  <span className="snack-of-legend-badge text-[9px] py-0 px-1">
                    ★ Legend
                  </span>
                )}
              </span>
              <span>{formatDateDDMMYYYY(snack.dateBroughtIn)}</span>
            </div>

            {/* Poster Block */}
            <div className="relative aspect-[4/3] bg-[var(--card-poster-bg)] border-b border-[var(--border-color)] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              <div className="font-black text-4xl tracking-tighter opacity-20 uppercase mb-2 select-none">
                {snack.category}
              </div>
              <span className="text-[12px] font-mono-tabular uppercase tracking-widest opacity-70">
                {snack.origin}
                {snack.region ? ` · ${snack.region}` : ''}
              </span>
              
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                <div className="bg-[var(--fg)] text-[var(--bg)] text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider">
                  {snack.category}
                </div>
                {isLegendary && (
                  <div className="snack-of-legend-badge text-[9px]">
                    ★ Snack of legend
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-1 leading-tight group-hover:underline">
                  {snack.name}
                </h3>
                <p className="text-xs font-mono-tabular text-[var(--fg)]/70 mb-3">
                  Donor: {snack.broughtBy} · In: {formatDateDDMMYYYY(snack.dateBroughtIn)}
                </p>
                <p className="text-sm line-clamp-3 leading-relaxed opacity-85 mb-3">
                  {snack.notes || 'No notes logged.'}
                </p>
              </div>

              {/* Card Rating & Footer */}
              <div className="mt-2 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <StarRating
                    snackId={snack.id}
                    ratingSum={snack.ratingSum}
                    ratingCount={snack.ratingCount}
                    userRating={userRating}
                    onRate={onRateSnack}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono-tabular pt-1 opacity-70">
                  <span>{snack.origin}</span>
                  <span className="font-bold uppercase tracking-tight group-hover:underline">
                    Inspect Record →
                  </span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
