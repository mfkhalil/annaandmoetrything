'use client';

import { RankedItem, CATEGORIES } from '../types';
import { calculateScore } from '../utils/ranking';

interface FinalChartProps {
  items: RankedItem[];
  onClose: () => void;
}

export default function FinalChart({ items, onClose }: FinalChartProps) {
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  const handlePrint = () => {
    window.print();
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return { 
      badge: 'bg-gradient-to-br from-[#ffcd00] to-[#f5b800] text-stone-900',
      card: 'bg-gradient-to-r from-[#ffcd00]/10 to-transparent border-[#ffcd00]/30'
    };
    if (index === 1) return { 
      badge: 'bg-gradient-to-br from-[#cfcacc] to-[#a8a4a6] text-stone-800',
      card: 'bg-gradient-to-r from-[#cfcacc]/10 to-transparent border-[#cfcacc]/30'
    };
    if (index === 2) return { 
      badge: 'bg-gradient-to-br from-[#cd7f32] to-[#a86428] text-white',
      card: 'bg-gradient-to-r from-[#cd7f32]/10 to-transparent border-[#cd7f32]/30'
    };
    return { 
      badge: 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)]',
      card: 'bg-[var(--card-bg)] border-[var(--border)]'
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 overflow-y-auto print:static print:bg-white print:overflow-visible">
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center print:block print:p-0 print:min-h-0">
        <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl w-full max-w-4xl p-6 md:p-10 print:shadow-none print:max-w-full print:p-8 print:rounded-none animate-scale-in">
          
          {/* Header */}
          <header className="text-center mb-10 pb-6 border-b border-[var(--border)] print:mb-6 print:pb-4 print:border-stone-300">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-[#ffcd00] to-[#ff7cba] shadow-lg print:hidden">
              <span className="text-2xl">🏆</span>
            </div>
            
            <h1 className="font-[family-name:var(--font-clash)] text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-2 tracking-tight print:text-3xl print:text-black">
              Anna & Moe <span className="bg-gradient-to-r from-[#ff7cba] via-[#b31d42] to-[#1aa0dc] bg-clip-text text-transparent print:text-black">Try Things</span>
            </h1>
            
            <div className="flex items-center justify-center gap-3 text-[var(--foreground-muted)] text-sm font-medium uppercase tracking-widest print:text-xs">
              <span>Official Rankings</span>
              <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)]"></span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </header>

          {/* Rankings List */}
          <div className="space-y-3 mb-10 print:space-y-1 print:mb-6">
            {sortedItems.map((item, index) => {
              const score = calculateScore(item.position, items.length);
              const isTop3 = index < 3;
              const style = getRankStyle(index);
              const category = CATEGORIES.find(c => c.id === item.category);
              
              return (
                <div
                  key={item.id}
                  className={`
                    relative flex items-center gap-4 p-4 rounded-xl border
                    print:p-2 print:rounded-none print:border-b print:border-t-0 print:border-x-0 print:border-stone-200
                    ${style.card}
                  `}
                >
                  {/* Rank Badge */}
                  <div className={`
                    w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-[family-name:var(--font-clash)] font-bold text-lg
                    print:w-6 print:h-6 print:text-sm print:bg-transparent print:text-stone-900
                    ${style.badge}
                  `}>
                    <span className="print:hidden">#{index + 1}</span>
                    <span className="hidden print:inline">{index + 1}.</span>
                  </div>

                  {/* Image */}
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--background-tertiary)] print:hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl opacity-50">
                        {category?.icon || '🎯'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate ${
                      isTop3 ? 'text-lg text-[var(--foreground)] print:text-base' : 'text-[var(--foreground-secondary)] print:text-sm'
                    }`}>
                      {item.name}
                    </h3>
                  </div>

                  {/* Score */}
                  <div className="text-right px-3 border-l border-[var(--border)] print:border-none print:px-0">
                    <div className={`font-[family-name:var(--font-clash)] font-bold ${
                      isTop3 ? 'text-2xl text-[var(--foreground)] print:text-lg' : 'text-xl text-[var(--foreground-muted)] print:text-base'
                    }`}>
                      {score}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 py-6 border-t border-[var(--border)] text-center print:py-4 print:border-stone-300">
            <div>
              <div className="text-2xl font-[family-name:var(--font-clash)] font-bold text-[var(--foreground)] print:text-lg">{items.length}</div>
              <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest">Items</div>
            </div>
            <div>
              <div className="text-2xl font-[family-name:var(--font-clash)] font-bold text-[var(--accent-primary)] print:text-black print:text-lg">
                {sortedItems[0]?.name || '-'}
              </div>
              <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest">Winner</div>
            </div>
            <div>
              <div className="text-2xl font-[family-name:var(--font-clash)] font-bold text-[var(--foreground)] print:text-lg">100%</div>
              <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest">Accurate</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#b31d42] to-[#e74b6f] hover:from-[#8a1632] hover:to-[#b31d42] text-white font-bold rounded-xl shadow-lg shadow-[#b31d42]/20 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print List
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] font-bold rounded-xl transition-colors border border-[var(--border)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
