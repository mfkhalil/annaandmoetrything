import { AppState, RankedItem } from '../types';

const STORAGE_KEY = 'anna-moe-rankings';

// ============================================
// LOCAL STORAGE (works offline)
// ============================================

export function loadState(): AppState {
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

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// IMAGE UTILITIES
// ============================================

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file size (5MB max)
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

      // Scale down if needed
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
// SUPABASE CLIENT (for future integration)
// ============================================

// To use Supabase, install the client:
// npm install @supabase/supabase-js

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// SUPABASE STORAGE FUNCTIONS
// ============================================

export async function loadFromSupabase(rankingId: string): Promise<RankedItem[]> {
  const { data, error } = await supabase
    .from('ranked_items')
    .select('*')
    .eq('ranking_id', rankingId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error loading from Supabase:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image_url,
    category: item.category,
    notes: item.notes,
    position: item.position,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function saveToSupabase(rankingId: string, items: RankedItem[]): Promise<boolean> {
  // Delete existing items
  const { error: deleteError } = await supabase
    .from('ranked_items')
    .delete()
    .eq('ranking_id', rankingId);

  if (deleteError) {
    console.error('Error deleting items:', deleteError);
    return false;
  }

  // Insert new items
  const { error: insertError } = await supabase
    .from('ranked_items')
    .insert(
      items.map(item => ({
        ranking_id: rankingId,
        name: item.name,
        category: item.category,
        image_url: item.image,
        notes: item.notes,
        position: item.position,
      }))
    );

  if (insertError) {
    console.error('Error inserting items:', insertError);
    return false;
  }

  return true;
}

export async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createRanking(name: string, isPublic = false): Promise<string | null> {
  const { data, error } = await supabase
    .from('rankings')
    .insert({
      name,
      is_public: isPublic,
      share_code: generateShareCode(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating ranking:', error);
    return null;
  }

  return data.id;
}

export async function getRankingByShareCode(shareCode: string): Promise<RankedItem[] | null> {
  const { data: ranking, error: rankingError } = await supabase
    .from('rankings')
    .select('id')
    .eq('share_code', shareCode)
    .single();

  if (rankingError || !ranking) {
    console.error('Error finding ranking:', rankingError);
    return null;
  }

  return loadFromSupabase(ranking.id);
}

function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
*/

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
