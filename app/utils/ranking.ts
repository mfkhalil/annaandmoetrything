import { RankedItem } from '../types';

/**
 * Binary search-based comparative ranking
 * Returns a list of items to compare against to find the right position
 */
export function getComparisonsNeeded(
  items: RankedItem[],
  currentLow: number = 0,
  currentHigh: number = items.length
): { comparisons: RankedItem[], low: number, high: number } {
  if (items.length === 0) {
    return { comparisons: [], low: 0, high: 0 };
  }

  const comparisons: RankedItem[] = [];
  const low = currentLow;
  const high = currentHigh;

  // We'll do a binary search, so we need the middle item
  const mid = Math.floor((low + high) / 2);
  
  if (low < high && mid < items.length) {
    comparisons.push(items[mid]);
  }

  return { comparisons, low, high };
}

/**
 * Process comparison result and get next comparison or final position
 */
export function processComparison(
  items: RankedItem[],
  isBetter: boolean,
  currentLow: number,
  currentHigh: number,
  lastComparedIndex: number
): { comparisons: RankedItem[], low: number, high: number, finalPosition?: number } {
  let low = currentLow;
  let high = currentHigh;

  if (isBetter) {
    // New item is better, search lower positions (smaller indices)
    high = lastComparedIndex;
  } else {
    // New item is worse, search higher positions (larger indices)
    low = lastComparedIndex + 1;
  }

  // Check if we've found the position
  if (low >= high) {
    return { comparisons: [], low, high, finalPosition: low };
  }

  // Get next comparison
  const mid = Math.floor((low + high) / 2);
  const comparisons = mid < items.length ? [items[mid]] : [];

  return { comparisons, low, high };
}

/**
 * Insert item at position and update all positions
 */
export function insertItemAtPosition(
  items: RankedItem[],
  newItem: RankedItem,
  position: number
): RankedItem[] {
  const updatedItems = [...items];
  
  // Update positions of items that will shift
  updatedItems.forEach(item => {
    if (item.position >= position) {
      item.position++;
    }
  });

  // Set new item position
  newItem.position = position;
  newItem.updated_at = new Date().toISOString();
  
  // Insert new item
  updatedItems.splice(position, 0, newItem);
  
  return updatedItems;
}

/**
 * Calculate weighted score (higher position = higher score)
 * Top item gets highest score
 */
export function calculateScore(position: number, totalItems: number): number {
  if (totalItems === 0) return 100;
  return Math.round(((totalItems - position) / totalItems) * 100);
}
