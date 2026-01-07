export interface RankedItem {
  id: string;
  name: string;
  image?: string; // base64 encoded image or URL
  position: number; // 0-indexed position in the ranked list
  category?: string; // optional category (food, drinks, experiences, etc.)
  notes?: string; // optional notes about the item
  created_at?: string;
  updated_at?: string;
}

export interface ComparisonState {
  itemToRank: RankedItem;
  comparisons: RankedItem[];
  comparisonIndex: number;
  low: number;
  high: number;
}

export interface AppState {
  items: RankedItem[];
  hasCompleted: boolean;
}

// Categories for items
export const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
  { id: 'desserts', label: 'Desserts', icon: '🍰' },
  { id: 'restaurants', label: 'Restaurants', icon: '🏪' },
  { id: 'experiences', label: 'Experiences', icon: '✨' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'other', label: 'Other', icon: '🎯' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];
