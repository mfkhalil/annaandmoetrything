'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RankedItem, ComparisonState } from './types';
import { loadStateSync, saveStateSync } from './utils/storage';
import { loadItems, saveAllItems } from './utils/supabase';
import { getComparisonsNeeded, processComparison, insertItemAtPosition } from './utils/ranking';
import AddItemForm from './components/AddItemForm';
import ComparisonView from './components/ComparisonView';
import RankedList from './components/RankedList';

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<RankedItem[]>([]);
  const [comparisonState, setComparisonState] = useState<ComparisonState | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      // Load from localStorage first (instant)
      const localState = loadStateSync();
      setItems(localState.items);
      setHasCompleted(localState.hasCompleted);
      setMounted(true);

      // Then try to load from Supabase (async)
      try {
        const supabaseItems = await loadItems();
        if (supabaseItems.length > 0) {
          setItems(supabaseItems);
          // Update localStorage with Supabase data
          saveStateSync({ items: supabaseItems, hasCompleted: localState.hasCompleted });
        }
      } catch (error) {
        console.error('Failed to load from Supabase:', error);
      }
    };

    init();
  }, []);

  // Save to both localStorage and Supabase when items change
  const syncToSupabase = useCallback(async (newItems: RankedItem[]) => {
    // Save to localStorage immediately
    saveStateSync({ items: newItems, hasCompleted });

    // Sync to Supabase in background
    setIsSyncing(true);
    try {
      await saveAllItems(newItems);
    } catch (error) {
      console.error('Failed to sync to Supabase:', error);
    }
    setIsSyncing(false);
  }, [hasCompleted]);

  const handleAddItem = (name: string, image?: string, category?: string) => {
    const newItem: RankedItem = {
      id: Date.now().toString(),
      name,
      image,
      category,
      position: 0,
      created_at: new Date().toISOString(),
    };

    if (items.length === 0) {
      newItem.position = 0;
      const newItems = [newItem];
      setItems(newItems);
      syncToSupabase(newItems);
    } else {
      const { comparisons, low, high } = getComparisonsNeeded(items);
      setComparisonState({
        itemToRank: newItem,
        comparisons,
        comparisonIndex: 0,
        low,
        high,
      });
    }
  };

  const handleComparison = (isBetter: boolean) => {
    if (!comparisonState) return;

    const currentComparisonItem = comparisonState.comparisons[comparisonState.comparisonIndex];
    const result = processComparison(
      items,
      isBetter,
      comparisonState.low,
      comparisonState.high,
      currentComparisonItem.position
    );

    if (result.finalPosition !== undefined) {
      const updatedItems = insertItemAtPosition(items, comparisonState.itemToRank, result.finalPosition);
      setItems(updatedItems);
      setComparisonState(null);
      syncToSupabase(updatedItems);
    } else {
      setComparisonState({
        ...comparisonState,
        comparisons: result.comparisons,
        comparisonIndex: 0,
        low: result.low,
        high: result.high,
      });
    }
  };

  const handleComplete = () => {
    setHasCompleted(true);
    saveStateSync({ items, hasCompleted: true });
    router.push('/final');
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[var(--accent-highlight)]/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[var(--accent-secondary)]/5 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Header */}
        <header className="mb-10 md:mb-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7cba] to-[#b31d42] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--background)]">A</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1aa0dc] to-[#0d8bc4] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--background)]">M</div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground-muted)]">
                  Official Rankings
                </span>
                {isSyncing && (
                  <span className="flex items-center gap-1 text-xs text-[var(--accent-secondary)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
                    Syncing...
                  </span>
                )}
              </div>
              <h1 className="font-[family-name:var(--font-clash)] text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--foreground)] tracking-tight">
                Try <span className="bg-gradient-to-r from-[#ff7cba] via-[#b31d42] to-[#1aa0dc] bg-clip-text text-transparent">Things</span>
              </h1>
              <p className="mt-2 text-[var(--foreground-secondary)] text-base md:text-lg max-w-md">
                Rank everything we try together. Food, drinks, experiences, and more.
              </p>
            </div>
            
            {items.length > 0 && !comparisonState && (
              <button
                onClick={handleComplete}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent-primary)] text-[var(--foreground-secondary)] hover:text-[var(--accent-primary)] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span>{hasCompleted ? 'View Rankings' : 'Export List'}</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Panel: Action Area */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-lg shadow-[var(--card-shadow)] overflow-hidden animate-fade-in">
              {/* Accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#ff7cba] via-[#b31d42] to-[#1aa0dc]" />
              
              <div className="p-5 md:p-7">
                {comparisonState ? (
                  <ComparisonView
                    newItem={comparisonState.itemToRank}
                    compareItem={comparisonState.comparisons[comparisonState.comparisonIndex]}
                    onChoice={handleComparison}
                    progress={`Step ${comparisonState.comparisonIndex + 1} of ~${Math.ceil(Math.log2(items.length + 1))}`}
                  />
                ) : (
                  <div className="min-h-[380px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffcd00]/20 to-[#ff7cba]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-[family-name:var(--font-clash)] text-xl font-bold text-[var(--foreground)]">
                          Add Something New
                        </h2>
                        <p className="text-sm text-[var(--foreground-muted)]">What did you try today?</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <AddItemForm onSubmit={handleAddItem} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: List */}
          <div className="lg:col-span-7">
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-lg shadow-[var(--card-shadow)] p-5 md:p-7 min-h-[500px] animate-fade-in stagger-1">
              <RankedList items={items} />
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <footer className="mt-16 py-6 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            Made with <span className="text-[#b31d42]">♥</span> by Anna & Moe
          </p>
        </footer>
      </div>
    </main>
  );
}
