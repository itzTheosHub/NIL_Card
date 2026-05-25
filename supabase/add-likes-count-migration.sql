-- Add likes_count column to profile_social_stats
-- Run in Supabase SQL editor

ALTER TABLE profile_social_stats
  ADD COLUMN IF NOT EXISTS likes_count bigint;
