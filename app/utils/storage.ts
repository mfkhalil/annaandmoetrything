import { AppState, RankedItem } from '../types';
import { loadItems, saveAllItems } from './supabase';

const STORAGE_KEY = 'anna-moe-rankings';

// ============================================
// HYBRID STORAGE (LocalStorage + Supabase)
// ============================================

export async function loadState(): Promise<AppState> {
  if (typeof window === 'undefined') {
    return { items: [], hasCompleted: false };
  }

  // Try Supabase first
  try {
    const supabaseItems = await loadItems();
    if (supabaseItems.length > 0) {
      // Sync to local storage as backup
      const state = { items: supabaseItems, hasCompleted: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
  } catch (error) {
    console.error('Supabase load failed, falling back to localStorage:', error);
  }

  // Fall back to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }

  return { items: [], hasCompleted: false };
}

export async function saveState(state: AppState): Promise<void> {
  if (typeof window === 'undefined') return;

  // Always save to localStorage first (fast)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }

  // Then sync to Supabase (async)
  try {
    await saveAllItems(state.items);
  } catch (error) {
    console.error('Error saving to Supabase:', error);
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// SYNC-ONLY LOCAL STORAGE (for immediate use)
// ============================================

export function loadStateSync(): AppState {
  if (typeof window === 'undefined') {
    return { items: [], hasCompleted: false };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }

  return { items: [], hasCompleted: false };
}

export function saveStateSync(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// ============================================
// IMAGE UTILITIES
// ============================================

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Image must be less than 5MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(base64: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = base64;
  });
}

// ============================================
// EXPORT/IMPORT UTILITIES
// ============================================

export function exportToJSON(items: RankedItem[]): string {
  return JSON.stringify({
    version: '1.0',
    exported_at: new Date().toISOString(),
    items: items.map(item => ({
      name: item.name,
      category: item.category,
      position: item.position,
      notes: item.notes,
    })),
  }, null, 2);
}

export function importFromJSON(json: string): RankedItem[] | null {
  try {
    const data = JSON.parse(json);
    if (!data.items || !Array.isArray(data.items)) {
      return null;
    }

    return data.items.map((item: { name: string; category?: string; position: number; notes?: string }, index: number) => ({
      id: `imported-${Date.now()}-${index}`,
      name: item.name,
      category: item.category || 'other',
      position: item.position,
      notes: item.notes,
      created_at: new Date().toISOString(),
    }));
  } catch {
    return null;
  }
}
