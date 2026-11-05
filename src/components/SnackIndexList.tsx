import React from 'react';
import { Snack } from '../types.ts';
import { StarRating } from './StarRating.tsx';
import { EmptyState } from './EmptyState.tsx';

interface SnackIndexListProps {
  snacks: Snack[];
  onSelectSnack: (snack: Snack) => void;
  onOpenAddModal: () => void;
  userRatings: Record<string, number>;
  onRateSnack: (snackId: string, rating: number) => Promise<void>;
  legendarySnackIds?: Set<string>;
  isTableBumped?: boolean;
}

export const SnackIndexList: React.FC<SnackIndexListProps> = ({
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
    <div className="w-full">
      {/* Table Column Headers */}
      <div className="grid grid-cols-[36px_1.4fr_180px] md:grid-cols-[44px_1.8fr_100px_1fr_200px] lg:grid-cols-[50px_2fr_110px_1.1fr_1fr_220px] py-2 px-3 text-[11px] md:text-[12px] font-mono-tabular uppercase tracking-wider opacity-60 border-b border-[var(--border-subtle)] select-none">
        <div>Ref</div>
        <div>Title & Category</div>
        <div className="hidden md:block">Brought In</div>
        <div className="hidden md:block">Provenance</div>
        <div className="hidden lg:block">Brought By</div>
        <div className="text-right sm:text-left">Rating & Community Score</div>
      </div>

      {/* Rows */}
      <div className="border-b border-[var(--border-color)]">
        {snacks.map((snack, idx) => {
          const indexCode = `S${String(idx + 1).padStart(2, '0')}`;
          const userRating = userRatings[snack.id] ?? null;
          const isLegendary =
            legendarySnackIds.has(snack.id) ||
            ((snack.ratingCount ?? 0) >= 2 &&
              (snack.ratingSum ?? 0) / (snack.ratingCount ?? 1) === 5);

          return (
            <div
              key={snack.id}
              tabIndex={0}
              role="button"
              onClick={() => onSelectSnack(snack)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  // Only open modal if event wasn't captured inside rating control
                  if ((e.target as HTMLElement).getAttribute('role') !== 'slider') {
                    e.preventDefault();
                    onSelectSnack(snack);
                  }
                }
              }}
              style={{
                animationDelay: isTableBumped ? `${(idx % 12) * 35}ms` : undefined,
              }}
              className={`snack-row group relative transition-colors ${
                isLegendary ? 'legendary-gold-shimmer' : ''
              } ${isTableBumped ? 'table-bump-wobble' : ''}`}
            >
              {/* Ref Number */}
              <div className="font-mono-tabular text-[12px] md:text-[14px] font-bold opacity-80 group-hover:opacity-100 flex items-center gap-1">
                {indexCode}
              </div>

              {/* Name & Classification */}
              <div className="pr-2">
                <span className="font-bold text-[16px] md:text-[18px] tracking-tight block md:inline mr-2">
                  {snack.name}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-mono-tabular opacity-60 group-hover:opacity-100 mr-2">
                  [{snack.category}]
                </span>
                {isLegendary && (
                  <span className="snack-of-legend-badge inline-flex align-middle my-0.5">
                    ★ Snack of legend
                  </span>
                )}
                <div className="md:hidden text-[11px] font-mono-tabular opacity-60 mt-0.5">
                  {formatDateDDMMYYYY(snack.dateBroughtIn)} · {snack.origin} · By {snack.broughtBy}
                </div>
              </div>

              {/* Date Brought In */}
              <div className="hidden md:block font-mono-tabular text-[13px] opacity-80 group-hover:opacity-100">
                {formatDateDDMMYYYY(snack.dateBroughtIn)}
              </div>

              {/* Origin & Region */}
              <div className="hidden md:block text-[13px] md:text-[15px] truncate font-medium">
                {snack.origin}
                {snack.region && (
                  <span className="text-[11px] font-mono-tabular opacity-60 ml-1">
                    ({snack.region})
                  </span>
                )}
              </div>

              {/* Brought By */}
              <div className="hidden lg:block text-[13px] md:text-[15px] truncate opacity-90 group-hover:opacity-100">
                {snack.broughtBy}
              </div>

              {/* Five-Star Rating Control + Score */}
              <div className="flex justify-end sm:justify-start">
                <StarRating
                  snackId={snack.id}
                  ratingSum={snack.ratingSum}
                  ratingCount={snack.ratingCount}
                  userRating={userRating}
                  onRate={onRateSnack}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
