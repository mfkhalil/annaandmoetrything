'use client';

import { RankedItem, CATEGORIES } from '../types';
import { calculateScore } from '../utils/ranking';

interface RankedListProps {
  items: RankedItem[];
}

export default function RankedList({ items }: RankedListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No rankings yet</h3>
        <p className="text-[var(--foreground-muted)] max-w-xs">
          Add your first item to start building your ultimate ranking list.
        </p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  const getRankStyle = (index: number) => {
    if (index === 0) return { 
      badge: 'bg-gradient-to-br from-[#ffcd00] to-[#f5b800] text-stone-900',
      ring: 'ring-2 ring-[#ffcd00]/30',
      glow: 'shadow-[#ffcd00]/20'
    };
    if (index === 1) return { 
      badge: 'bg-gradient-to-br from-[#cfcacc] to-[#a8a4a6] text-stone-800',
      ring: 'ring-2 ring-[#cfcacc]/30',
      glow: 'shadow-[#cfcacc]/20'
    };
    if (index === 2) return { 
      badge: 'bg-gradient-to-br from-[#cd7f32] to-[#a86428] text-white',
      ring: 'ring-2 ring-[#cd7f32]/30',
      glow: 'shadow-[#cd7f32]/20'
    };
    return { 
      badge: 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)]',
      ring: '',
      glow: ''
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1aa0dc]/20 to-[#ff7cba]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-clash)] text-xl font-bold text-[var(--foreground)]">
              Leaderboard
            </h2>
            <p className="text-xs text-[var(--foreground-muted)]">{items.length} item{items.length !== 1 ? 's' : ''} ranked</p>
          </div>
        </div>
      </div>
      
      {/* List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {sortedItems.map((item, index) => {
          const score = calculateScore(item.position, items.length);
          const isTop3 = index < 3;
          const style = getRankStyle(index);
          const category = CATEGORIES.find(c => c.id === item.category);
          
          return (
            <div
              key={item.id}
              className={`
                group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 
                ${isTop3 
                  ? `bg-[var(--card-bg-elevated)] border border-[var(--border)] ${style.ring} shadow-lg ${style.glow}` 
                  : 'hover:bg-[var(--background-secondary)]'
                }
                animate-slide-up
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Position Badge */}
              <div className={`
                flex items-center justify-center w-9 h-9 rounded-lg font-[family-name:var(--font-clash)] font-bold text-sm
                ${style.badge}
              `}>
                {index + 1}
              </div>
              
              {/* Image */}
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[var(--background-tertiary)] border border-[var(--border-subtle)] flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    {category?.icon || '🎯'}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${isTop3 ? 'text-[var(--foreground)]' : 'text-[var(--foreground-secondary)]'}`}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {category && (
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {category.icon} {category.label}
                    </span>
                  )}
                  {isTop3 && index === 0 && (
                    <span className="text-xs font-medium text-[var(--accent-warning)]">👑 Best</span>
                  )}
                </div>
              </div>
              
              {/* Score */}
              <div className="text-right flex-shrink-0">
                <div className={`font-[family-name:var(--font-clash)] font-bold text-lg ${
                  isTop3 ? 'text-[var(--accent-primary)]' : 'text-[var(--foreground-muted)]'
                }`}>
                  {score}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wide">
                  pts
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
