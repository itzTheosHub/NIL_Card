-- ============================================================
-- Phyllo Social Connect Migration
-- Run block 1 first, then block 2
-- ============================================================


-- BLOCK 1: Create profile_social_stats table
-- ============================================================

CREATE TABLE profile_social_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  followers INT4,
  avg_views FLOAT4,
  engagement_rate FLOAT4,
  total_posts INT4,
  connected BOOLEAN DEFAULT FALSE,
  phyllo_account_id TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, platform)
);

-- Enable RLS
ALTER TABLE profile_social_stats ENABLE ROW LEVEL SECURITY;

-- Athletes can read their own stats
CREATE POLICY "Users can read own social stats"
ON profile_social_stats FOR SELECT
USING (profile_id IN (
  SELECT id FROM profiles WHERE id = auth.uid()
));

-- Athletes can insert their own stats
CREATE POLICY "Users can insert own social stats"
ON profile_social_stats FOR INSERT
WITH CHECK (profile_id IN (
  SELECT id FROM profiles WHERE id = auth.uid()
));

-- Athletes can update their own stats
CREATE POLICY "Users can update own social stats"
ON profile_social_stats FOR UPDATE
USING (profile_id IN (
  SELECT id FROM profiles WHERE id = auth.uid()
));

-- Athletes can delete their own stats
CREATE POLICY "Users can delete own social stats"
ON profile_social_stats FOR DELETE
USING (profile_id IN (
  SELECT id FROM profiles WHERE id = auth.uid()
));

-- Public can read social stats (for profile view page)
CREATE POLICY "Public can read social stats"
ON profile_social_stats FOR SELECT
USING (true);


-- BLOCK 2: Add Phyllo and audience columns to profiles table
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phyllo_user_id TEXT,
  ADD COLUMN IF NOT EXISTS audience_age_18_24 FLOAT4,
  ADD COLUMN IF NOT EXISTS audience_age_25_34 FLOAT4,
  ADD COLUMN IF NOT EXISTS audience_age_35_plus FLOAT4,
  ADD COLUMN IF NOT EXISTS audience_gender_male FLOAT4,
  ADD COLUMN IF NOT EXISTS audience_gender_female FLOAT4,
  ADD COLUMN IF NOT EXISTS audience_top_city TEXT,
  ADD COLUMN IF NOT EXISTS audience_top_country TEXT;
