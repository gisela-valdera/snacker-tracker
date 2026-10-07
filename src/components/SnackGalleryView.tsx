import React from 'react';
import { Snack } from '../types.ts';
import { StarRating } from './StarRating.tsx';

interface SnackGalleryViewProps {
  snacks: Snack[];
  onSelectSnack: (snack: Snack) => void;
  onOpenAddModal: () => void;
  userRatings: Record<string, number>;
  onRateSnack: (snackId: string, rating: number) => Promise<void>;
}

export const SnackGalleryView: React.FC<SnackGalleryViewProps> = ({
  snacks,
  onSelectSnack,
  onOpenAddModal,
  userRatings,
  onRateSnack,
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
    return (
      <div className="border border-[#161616] bg-[#161616]/5 p-8 md:p-14 text-center my-6">
        <div className="font-mono-tabular text-xs uppercase tracking-widest opacity-60 mb-3">
          Gallery View // Empty Archive
        </div>
        <h3 className="text-2xl md:text-3xl font-black uppercase mb-3">
          No snacks in the gallery
        </h3>
        <p className="text-base max-w-md mx-auto opacity-80 mb-6 leading-relaxed">
          The archive is waiting for its first shared entry. Add an office snack to start the collection.
        </p>
        <button onClick={onOpenAddModal} className="brutalist-btn">
          + Add First Snack
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
      {snacks.map((snack, idx) => {
        const indexCode = `S${String(idx + 1).padStart(2, '0')}`;
        const userRating = userRatings[snack.id] ?? null;
        
        return (
          <article
            key={snack.id}
            onClick={() => onSelectSnack(snack)}
            className="border border-[#161616] bg-[#E5E4DF] flex flex-col justify-between cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#161616] group"
          >
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#161616] font-mono-tabular text-[12px] bg-[#161616]/5 group-hover:bg-[#F2F1ED] group-hover:text-[#161616] transition-colors">
              <span className="font-bold">{indexCode} // {snack.origin.toUpperCase()}</span>
              <span>{formatDateDDMMYYYY(snack.dateBroughtIn)}</span>
            </div>

            {/* Poster Block */}
            <div className="relative aspect-[4/3] bg-[#DEDCD6] border-b border-[#161616] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              <div className="font-black text-4xl tracking-tighter opacity-20 uppercase mb-2 select-none">
                {snack.category}
              </div>
              <span className="text-[12px] font-mono-tabular uppercase tracking-widest opacity-70">
                {snack.origin}
                {snack.region ? ` · ${snack.region}` : ''}
              </span>
              
              <div className="absolute top-2 right-2 bg-[#161616] text-[#E5E4DF] text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider">
                {snack.category}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-1 leading-tight group-hover:underline">
                  {snack.name}
                </h3>
                <p className="text-xs font-mono-tabular text-[#161616]/70 mb-3">
                  Donor: {snack.broughtBy} · In: {formatDateDDMMYYYY(snack.dateBroughtIn)}
                </p>
                <p className="text-sm line-clamp-3 leading-relaxed opacity-85 mb-3">
                  {snack.notes || 'No notes logged.'}
                </p>
              </div>

              {/* Card Rating & Footer */}
              <div className="mt-2 pt-3 border-t border-[#161616]/20 flex flex-col gap-2">
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
