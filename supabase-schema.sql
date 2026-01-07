-- ============================================
-- Anna & Moe Try Things - Supabase Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table (optional - for multi-user support)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rankings table (a collection of ranked items)
CREATE TABLE IF NOT EXISTS rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Rankings',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ranked items table
CREATE TABLE IF NOT EXISTS ranked_items (
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
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rankings_user_id ON rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_share_code ON rankings(share_code);
CREATE INDEX IF NOT EXISTS idx_ranked_items_ranking_id ON ranked_items(ranking_id);
CREATE INDEX IF NOT EXISTS idx_ranked_items_position ON ranked_items(ranking_id, position);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranked_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Rankings policies
CREATE POLICY "Users can view their own rankings" 
  ON rankings FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own rankings" 
  ON rankings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings" 
  ON rankings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings" 
  ON rankings FOR DELETE 
  USING (auth.uid() = user_id);

-- Ranked items policies
CREATE POLICY "Users can view items in their rankings or public rankings" 
  ON ranked_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM rankings 
      WHERE rankings.id = ranked_items.ranking_id 
      AND (rankings.user_id = auth.uid() OR rankings.is_public = true)
    )
  );

CREATE POLICY "Users can create items in their own rankings" 
  ON ranked_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rankings 
      WHERE rankings.id = ranked_items.ranking_id 
      AND rankings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own rankings" 
  ON ranked_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM rankings 
      WHERE rankings.id = ranked_items.ranking_id 
      AND rankings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their own rankings" 
  ON ranked_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM rankings 
      WHERE rankings.id = ranked_items.ranking_id 
      AND rankings.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rankings_updated_at
  BEFORE UPDATE ON rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ranked_items_updated_at
  BEFORE UPDATE ON ranked_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Uncomment below to add sample data for testing:
/*
INSERT INTO rankings (name, description, is_public, share_code) 
VALUES ('Anna & Moe Try Things', 'Our definitive ranking list', true, 'annamoe1');

INSERT INTO ranked_items (ranking_id, name, category, position) 
VALUES 
  ((SELECT id FROM rankings WHERE share_code = 'annamoe1'), 'Levain Chocolate Chip Cookie', 'desserts', 0),
  ((SELECT id FROM rankings WHERE share_code = 'annamoe1'), 'In-N-Out Double Double', 'food', 1),
  ((SELECT id FROM rankings WHERE share_code = 'annamoe1'), 'Boba from Tiger Sugar', 'drinks', 2);
*/

-- ============================================
-- VIEWS (Optional - for easier querying)
-- ============================================

CREATE OR REPLACE VIEW ranking_with_items AS
SELECT 
  r.id as ranking_id,
  r.name as ranking_name,
  r.description,
  r.is_public,
  r.share_code,
  r.created_at as ranking_created_at,
  ri.id as item_id,
  ri.name as item_name,
  ri.category,
  ri.image_url,
  ri.notes,
  ri.position,
  ri.created_at as item_created_at
FROM rankings r
LEFT JOIN ranked_items ri ON r.id = ri.ranking_id
ORDER BY r.id, ri.position;

-- ============================================
-- STORAGE BUCKET (Run separately in Supabase Dashboard)
-- ============================================
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket called "item-images"
-- 3. Set it to public if you want images to be publicly accessible
-- 4. Add the following storage policy:
--    - Allow authenticated users to upload to their own folder
--    - Allow public read access

-- Example storage policies (add via Supabase Dashboard):
/*
-- For uploads (INSERT):
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

-- For reads (SELECT):
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');
*/

