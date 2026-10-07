import React, { useState, useRef } from 'react';

interface StarRatingProps {
  snackId: string;
  ratingSum?: number;
  ratingCount?: number;
  userRating: number | null;
  onRate: (snackId: string, rating: number) => Promise<void>;
  isCompact?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  snackId,
  ratingSum = 0,
  ratingCount = 0,
  userRating,
  onRate,
  isCompact = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [keyboardValue, setKeyboardValue] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasRated = userRating !== null;
  const count = ratingCount ?? 0;
  const sum = ratingSum ?? 0;
  const average = count > 0 ? (sum / count).toFixed(1) : null;

  // Active value to display on stars:
  // If user has rated: always display user's rating!
  // If not rated: hoverValue || keyboardValue || 0 (empty five-star control)
  const displayValue = hasRated
    ? userRating
    : hoverValue !== null
    ? hoverValue
    : keyboardValue !== null
    ? keyboardValue
    : 0;

  const handleRate = async (val: number) => {
    if (hasRated || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRate(snackId, val);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasRated || isSubmitting) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const current = keyboardValue ?? 0;
      const next = Math.min(5, Math.max(0.5, current + 0.5));
      setKeyboardValue(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const current = keyboardValue ?? 1;
      const next = Math.max(0.5, Math.min(5, current - 0.5));
      setKeyboardValue(next);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (keyboardValue !== null && keyboardValue >= 0.5) {
        handleRate(keyboardValue);
      }
    }
  };

  return (
    <div
      className="inline-flex items-center gap-2 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 5-Star Interactive or Locked Control */}
      <div
        ref={containerRef}
        role={hasRated ? 'img' : 'slider'}
        aria-label={
          hasRated
            ? `Your rating: ${userRating} out of 5 stars (locked)`
            : `Rate this snack. Current staged value: ${keyboardValue ?? 'none'}. Use left/right arrow keys to adjust in 0.5 increments, Enter to confirm.`
        }
        aria-valuenow={hasRated ? userRating : (keyboardValue ?? undefined)}
        aria-valuemin={0.5}
        aria-valuemax={5}
        tabIndex={hasRated ? -1 : 0}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHoverValue(null)}
        className={`flex items-center gap-1 ${
          hasRated
            ? 'cursor-default'
            : 'cursor-pointer focus-visible:outline-2 focus-visible:outline-[#161616]'
        }`}
      >
        {[1, 2, 3, 4, 5].map((starIdx) => {
          // Determine how this star is filled based on displayValue
          // If displayValue >= starIdx -> full
          // If displayValue === starIdx - 0.5 -> half
          // Else -> empty
          const isFull = displayValue >= starIdx;
          const isHalf = !isFull && displayValue >= starIdx - 0.5;

          const clipId = `star-half-clip-${snackId}-${starIdx}`;

          return (
            <div
              key={starIdx}
              className="relative w-4 h-4 md:w-[18px] md:h-[18px] shrink-0"
              onMouseMove={(e) => {
                if (hasRated || isSubmitting) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                setHoverValue(isLeftHalf ? starIdx - 0.5 : starIdx);
              }}
              onClick={() => {
                if (hasRated || isSubmitting) return;
                if (hoverValue !== null) {
                  handleRate(hoverValue);
                }
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full block"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <clipPath id={clipId}>
                    <rect x="0" y="0" width="12" height="24" />
                  </clipPath>
                </defs>

                {/* Star geometry: crisp, square-edged, sharp brutalist aesthetic */}
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={isFull ? '#161616' : 'none'}
                  stroke="#161616"
                  strokeWidth="2"
                  strokeLinejoin="miter"
                  strokeLinecap="square"
                />

                {/* Left-half fill overlay when isHalf */}
                {isHalf && (
                  <polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="#161616"
                    stroke="#161616"
                    strokeWidth="2"
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                    clipPath={`url(#${clipId})`}
                  />
                )}
              </svg>
            </div>
          );
        })}
      </div>

      {/* Side Label: Average and count or "No ratings yet" */}
      <div className="font-mono-tabular text-xs whitespace-nowrap text-[#161616]">
        {count > 0 ? (
          <span>
            <strong className="font-bold">{average}</strong>
            <span className="opacity-70 ml-1">({count})</span>
            {hasRated && (
              <span className="opacity-60 ml-1.5 text-[11px]">
                [You: {userRating}★]
              </span>
            )}
          </span>
        ) : (
          <span className="opacity-60 italic text-[11px] md:text-xs">
            {hasRated ? `You: ${userRating}★ (1)` : 'No ratings yet'}
          </span>
        )}
      </div>
    </div>
  );
};
