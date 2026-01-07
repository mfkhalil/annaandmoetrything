-- ============================================
-- Anna & Moe Try Things - Supabase Schema
-- SIMPLE VERSION - NO RLS, NO AUTH
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING (if re-running)
-- ============================================
DROP TABLE IF EXISTS ranked_items CASCADE;
DROP TABLE IF EXISTS rankings CASCADE;

-- ============================================
-- TABLES
-- ============================================

-- Rankings table (a collection of ranked items)
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Anna & Moe Try Things',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ranked items table
CREATE TABLE ranked_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  image_url TEXT,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DISABLE RLS (No authentication needed)
-- ============================================
ALTER TABLE rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ranked_items DISABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_ranked_items_ranking_id ON ranked_items(ranking_id);
CREATE INDEX idx_ranked_items_position ON ranked_items(ranking_id, position);

-- ============================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_rankings_updated_at
  BEFORE UPDATE ON rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ranked_items_updated_at
  BEFORE UPDATE ON ranked_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE DEFAULT RANKING
-- ============================================
INSERT INTO rankings (name, description) 
VALUES ('Anna & Moe Try Things', 'Our definitive ranking list for everything we try together')
RETURNING id;

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Run this separately or in Storage settings:
-- 1. Create bucket: item-images (public)
-- 2. No RLS policies needed for public bucket

-- If you want to create via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow all operations on storage (no auth)
DROP POLICY IF EXISTS "Allow all reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all inserts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes" ON storage.objects;

CREATE POLICY "Allow all reads" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Allow all inserts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images');
CREATE POLICY "Allow all updates" ON storage.objects FOR UPDATE USING (bucket_id = 'item-images');
CREATE POLICY "Allow all deletes" ON storage.objects FOR DELETE USING (bucket_id = 'item-images');
