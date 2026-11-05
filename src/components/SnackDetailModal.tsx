import React, { useEffect } from 'react';
import { Snack } from '../types.ts';
import { StarRating } from './StarRating.tsx';

interface SnackDetailModalProps {
  snack: Snack | null;
  onClose: () => void;
  indexNumber: number;
  userRating: number | null;
  onRateSnack: (snackId: string, rating: number) => Promise<void>;
  isLegendary?: boolean;
}

export const SnackDetailModal: React.FC<SnackDetailModalProps> = ({
  snack,
  onClose,
  indexNumber,
  userRating,
  onRateSnack,
  isLegendary = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!snack) return null;

  const indexCode = `S${String(indexNumber).padStart(2, '0')}`;

  const formatDateDDMMYYYY = (dateStr?: string): string => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return `${dd}/${mm}/${yyyy}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card-bg)] text-[var(--fg)] border-2 border-[var(--border-color)] shadow-[var(--overlay-shadow)] p-6 md:p-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6 font-mono-tabular text-xs">
          <div className="font-bold uppercase tracking-wider">
            Archive Accession // {indexCode}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer font-bold hover:underline uppercase text-sm"
          >
            [Close ✕]
          </button>
        </div>

        {/* Hero title */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2 font-mono-tabular text-xs uppercase opacity-75">
            <span>{snack.category}</span>
            <span>·</span>
            <span>
              {snack.origin}
              {snack.region ? ` (${snack.region})` : ''}
            </span>
            <span>·</span>
            <span>Brought in by {snack.broughtBy}</span>
            {isLegendary && (
              <span className="snack-of-legend-badge">
                ★ Snack of legend
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {snack.name}
          </h2>
          <div className="text-xs font-mono-tabular opacity-60 mt-1">
            Date brought in: {formatDateDDMMYYYY(snack.dateBroughtIn)}
          </div>
        </div>

        {/* Rating Section with StarRating */}
        <div className="border-t border-b border-[var(--border-color)] py-4 my-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-mono-tabular opacity-70 block mb-1">
                Community Evaluation
              </span>
              <div className="text-sm font-mono-tabular">
                {userRating !== null ? (
                  <span className="font-bold">Your score: {userRating}★ (Locked)</span>
                ) : (
                  <span className="opacity-75">Click or use arrow keys to rate (0.5 to 5.0)</span>
                )}
              </div>
            </div>
            
            <StarRating
              snackId={snack.id}
              ratingSum={snack.ratingSum}
              ratingCount={snack.ratingCount}
              userRating={userRating}
              onRate={onRateSnack}
            />
          </div>
        </div>

        {/* Tasting Notes */}
        <div className="mb-6 space-y-4">
          <div>
            <h4 className="text-xs font-mono-tabular uppercase tracking-wider opacity-70 mb-2">
              Tasting Notes & Observations
            </h4>
            <p className="text-base md:text-lg leading-relaxed font-normal">
              {snack.notes || 'No individual notes recorded for this accession.'}
            </p>
          </div>
        </div>

        {/* Actions - Read Only, immutable */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <span className="text-[11px] font-mono-tabular opacity-50 uppercase">
            Cloud Firestore Verified Record · Immutable
          </span>

          <button
            onClick={onClose}
            className="brutalist-btn text-xs"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};
