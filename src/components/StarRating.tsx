'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showScore?: boolean;
}

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  showScore = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = currentVal >= starValue;
          const isHalf = !isFilled && currentVal >= starValue - 0.5;

          return (
            <button
              key={idx}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } p-0.5`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-300/60 text-amber-400'
                    : 'fill-slate-200 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="text-sm font-semibold text-slate-800">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
