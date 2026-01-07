'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RankedItem, CATEGORIES } from '../types';
import { loadStateSync } from '../utils/storage';
import { calculateScore } from '../utils/ranking';

export default function FinalPage() {
  const router = useRouter();
  const [items, setItems] = useState<RankedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const state = loadStateSync();
    setItems(state.items);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-[var(--background)] print:bg-white">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute -top-[30%] -right-[15%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#ffcd00]/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[15%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#1aa0dc]/5 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 print:max-w-none print:p-8">
        
        {/* Header */}
        <header className="text-center mb-12 pb-8 border-b border-[var(--border)] print:mb-8 print:pb-6 print:border-stone-300">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#ffcd00] to-[#ff7cba] shadow-lg print:hidden">
            <span className="text-3xl">🏆</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex -space-x-2 print:hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7cba] to-[#b31d42] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--background)]">A</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1aa0dc] to-[#0d8bc4] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--background)]">M</div>
            </div>
          </div>

          <h1 className="font-[family-name:var(--font-clash)] text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-3 tracking-tight print:text-4xl print:text-black">
            Anna & Moe <span className="bg-gradient-to-r from-[#ff7cba] via-[#b31d42] to-[#1aa0dc] bg-clip-text text-transparent print:text-black">Try Things</span>
          </h1>
          
          <div className="flex items-center justify-center gap-3 text-[var(--foreground-muted)] text-base font-medium uppercase tracking-widest print:text-sm">
            <span>Official Rankings</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Rankings List */}
        <div className="space-y-3 mb-12 print:space-y-2 print:mb-8">
          {sortedItems.map((item, index) => {
            const score = calculateScore(item.position, items.length);
            const isTop3 = index < 3;
            const style = getRankStyle(index);
            const category = CATEGORIES.find(c => c.id === item.category);
            
            return (
              <div
                key={item.id}
                className={`
                  relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border transition-all
                  print:p-3 print:rounded-none print:border-b print:border-t-0 print:border-x-0 print:border-stone-200
                  ${style.card}
                  ${isTop3 ? 'shadow-lg' : ''}
                `}
              >
                {/* Rank Badge */}
                <div className={`
                  w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-xl font-[family-name:var(--font-clash)] font-bold text-xl sm:text-2xl
                  print:w-8 print:h-8 print:text-base print:bg-transparent print:text-stone-900
                  ${style.badge}
                `}>
                  <span className="print:hidden">#{index + 1}</span>
                  <span className="hidden print:inline">{index + 1}.</span>
                </div>

                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--background-tertiary)] border border-[var(--border-subtle)] shadow-inner print:hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                      {category?.icon || '🎯'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 print:hidden">
                    {category && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--background-secondary)] text-xs font-medium text-[var(--foreground-muted)]">
                        {category.icon} {category.label}
                      </span>
                    )}
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#ffcd00]/20 text-xs font-bold text-[#a86428]">
                        👑 CHAMPION
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold truncate ${
                    isTop3 
                      ? 'text-xl sm:text-2xl text-[var(--foreground)] print:text-lg' 
                      : 'text-lg text-[var(--foreground-secondary)] print:text-base'
                  }`}>
                    {item.name}
                  </h3>
                </div>

                {/* Score */}
                <div className="text-right px-3 sm:px-4 border-l border-[var(--border)] print:border-none print:px-0">
                  <div className={`font-[family-name:var(--font-clash)] font-bold ${
                    isTop3 
                      ? 'text-3xl sm:text-4xl text-[var(--foreground)] print:text-xl' 
                      : 'text-2xl text-[var(--foreground-muted)] print:text-lg'
                  }`}>
                    {score}
                  </div>
                  <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider print:hidden">
                    Score
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 py-8 border-t border-[var(--border)] text-center print:py-4 print:border-stone-300">
          <div>
            <div className="text-2xl sm:text-3xl font-[family-name:var(--font-clash)] font-bold text-[var(--foreground)] print:text-xl">
              {items.length}
            </div>
            <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest mt-1">
              Items Ranked
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-[family-name:var(--font-clash)] font-bold bg-gradient-to-r from-[#ff7cba] to-[#b31d42] bg-clip-text text-transparent print:text-black print:text-xl">
              {sortedItems[0]?.name || '-'}
            </div>
            <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest mt-1">
              #1 Champion
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-[family-name:var(--font-clash)] font-bold text-[var(--foreground)] print:text-xl">
              100%
            </div>
            <div className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest mt-1">
              Accuracy
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-4 bg-gradient-to-r from-[#b31d42] to-[#e74b6f] hover:from-[#8a1632] hover:to-[#b31d42] text-white font-bold rounded-xl shadow-xl shadow-[#b31d42]/20 transition-all hover:shadow-[#b31d42]/30 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Official List
          </button>
          <button
            onClick={() => router.push('/')}
            className="sm:w-auto px-8 py-4 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] font-bold rounded-xl transition-colors border border-[var(--border)]"
          >
            ← Back to Ranking
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[var(--border)] text-center print:hidden">
          <p className="text-sm text-[var(--foreground-muted)]">
            Made with <span className="text-[#b31d42]">♥</span> by Anna & Moe
          </p>
        </footer>
      </div>
    </div>
  );
}
