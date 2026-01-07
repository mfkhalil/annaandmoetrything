'use client';

import { RankedItem, CATEGORIES } from '../types';

interface ComparisonViewProps {
  newItem: RankedItem;
  compareItem: RankedItem;
  onChoice: (isBetter: boolean) => void;
  progress: string;
}

export default function ComparisonView({
  newItem,
  compareItem,
  onChoice,
  progress,
}: ComparisonViewProps) {
  const category = CATEGORIES.find(c => c.id === compareItem.category);
  
  return (
    <div className="min-h-[380px] flex flex-col">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-xs font-semibold text-[var(--foreground-muted)] mb-4 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
          {progress}
        </div>
        <h2 className="font-[family-name:var(--font-clash)] text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-tight">
          Is <span className="bg-gradient-to-r from-[#ff7cba] to-[#b31d42] bg-clip-text text-transparent">{newItem.name}</span> better?
        </h2>
      </div>

      {/* Compare Card */}
      <div className="flex-1 flex flex-col justify-center mb-6">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7cba]/20 via-[#1aa0dc]/20 to-[#ffcd00]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-[var(--card-bg-elevated)] rounded-2xl border border-[var(--border)] p-5 shadow-xl transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Image */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--background-tertiary)] shadow-inner border border-[var(--border-subtle)]">
                {compareItem.image ? (
                  <img
                    src={compareItem.image}
                    alt={compareItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {category?.icon || '🎯'}
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  {category && (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--background-secondary)] text-xs font-medium text-[var(--foreground-muted)]">
                      {category.icon} {category.label}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
                  {compareItem.name}
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-secondary)] text-sm font-medium">
                  <svg className="w-4 h-4 text-[var(--accent-warning)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Rank #{compareItem.position + 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChoice(true)}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 transition-all duration-200 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
        >
          <div className="relative z-10 flex flex-col items-center gap-1">
            <span className="text-2xl">👍</span>
            <span className="font-bold text-white text-sm sm:text-base">Yes, Better</span>
          </div>
          <div className="absolute inset-0 -translate-y-full bg-gradient-to-b from-white/20 to-transparent transition-transform duration-300 group-hover:translate-y-0" />
        </button>
        
        <button
          onClick={() => onChoice(false)}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-4 transition-all duration-200 hover:from-rose-400 hover:to-rose-500 active:scale-[0.98] shadow-lg shadow-rose-500/20"
        >
          <div className="relative z-10 flex flex-col items-center gap-1">
            <span className="text-2xl">👎</span>
            <span className="font-bold text-white text-sm sm:text-base">No, Worse</span>
          </div>
          <div className="absolute inset-0 -translate-y-full bg-gradient-to-b from-white/20 to-transparent transition-transform duration-300 group-hover:translate-y-0" />
        </button>
      </div>

      <p className="text-center text-xs text-[var(--foreground-muted)] mt-5 uppercase tracking-widest font-medium">
        Trust your instincts ✨
      </p>
    </div>
  );
}
