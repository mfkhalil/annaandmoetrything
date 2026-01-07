import { createClient } from '@supabase/supabase-js';
import { RankedItem } from '../types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default ranking ID - you'll get this after running the SQL
// For now, we'll fetch or create it automatically
let cachedRankingId: string | null = null;

export async function getRankingId(): Promise<string> {
  if (cachedRankingId) return cachedRankingId;

  // Try to get existing ranking
  const { data: existing } = await supabase
    .from('rankings')
    .select('id')
    .limit(1)
    .single();

  if (existing?.id) {
    cachedRankingId = existing.id;
    return existing.id;
  }

  // Create new ranking if none exists
  const { data: created, error } = await supabase
    .from('rankings')
    .insert({ name: 'Anna & Moe Try Things' })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating ranking:', error);
    throw error;
  }

  cachedRankingId = created.id;
  return created.id;
}

// ============================================
// CRUD OPERATIONS
// ============================================

export async function loadItems(): Promise<RankedItem[]> {
  try {
    const rankingId = await getRankingId();
    
    const { data, error } = await supabase
      .from('ranked_items')
      .select('*')
      .eq('ranking_id', rankingId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading items:', error);
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
  } catch (error) {
    console.error('Error in loadItems:', error);
    return [];
  }
}

export async function saveItem(item: RankedItem): Promise<RankedItem | null> {
  try {
    const rankingId = await getRankingId();

    const { data, error } = await supabase
      .from('ranked_items')
      .upsert({
        id: item.id,
        ranking_id: rankingId,
        name: item.name,
        category: item.category,
        image_url: item.image,
        notes: item.notes,
        position: item.position,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving item:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      image: data.image_url,
      category: data.category,
      notes: data.notes,
      position: data.position,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in saveItem:', error);
    return null;
  }
}

export async function saveAllItems(items: RankedItem[]): Promise<boolean> {
  try {
    const rankingId = await getRankingId();

    // Delete all existing items first
    const { error: deleteError } = await supabase
      .from('ranked_items')
      .delete()
      .eq('ranking_id', rankingId);

    if (deleteError) {
      console.error('Error deleting items:', deleteError);
      return false;
    }

    if (items.length === 0) return true;

    // Insert all items
    const { error: insertError } = await supabase
      .from('ranked_items')
      .insert(
        items.map(item => ({
          ranking_id: rankingId,
          name: item.name,
          category: item.category || 'other',
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
  } catch (error) {
    console.error('Error in saveAllItems:', error);
    return false;
  }
}

export async function deleteItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ranked_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteItem:', error);
    return false;
  }
}

export async function updatePositions(items: RankedItem[]): Promise<boolean> {
  try {
    const updates = items.map(item => 
      supabase
        .from('ranked_items')
        .update({ position: item.position })
        .eq('id', item.id)
    );

    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating positions:', error);
    return false;
  }
}

// ============================================
// IMAGE UPLOAD
// ============================================

export async function uploadImage(base64: string): Promise<string | null> {
  try {
    // Convert base64 to blob
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const filePath = `images/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

