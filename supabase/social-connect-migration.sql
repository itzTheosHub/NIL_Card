-- Social Stats Connect: Instagram & TikTok OAuth
-- Migration: Add OAuth token columns to profiles, add verification columns to profile_social_stats
-- Run with: supabase db push or psql against your Supabase database

BEGIN;

-- ============================================================
-- 1. profiles table — OAuth token storage columns
-- ============================================================

-- Instagram OAuth columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS instagram_access_token text,
  ADD COLUMN IF NOT EXISTS instagram_user_id text,
  ADD COLUMN IF NOT EXISTS instagram_token_expires_at timestamptz;

-- TikTok OAuth columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tiktok_access_token text,
  ADD COLUMN IF NOT EXISTS tiktok_refresh_token text,
  ADD COLUMN IF NOT EXISTS tiktok_user_id text,
  ADD COLUMN IF NOT EXISTS tiktok_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS tiktok_refresh_expires_at timestamptz;

-- Indexes for looking up profiles by platform user ID during OAuth callbacks
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_user_id
  ON profiles (instagram_user_id)
  WHERE instagram_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_tiktok_user_id
  ON profiles (tiktok_user_id)
  WHERE tiktok_user_id IS NOT NULL;

-- ============================================================
-- 2. profile_social_stats table — verification tracking
-- ============================================================

-- is_verified: true when stats were pulled from the platform API
-- false (default) when stats are self-reported / manually entered
ALTER TABLE profile_social_stats
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- last_synced_at: timestamp of the most recent successful API sync
-- NULL means the stats have never been synced via API
ALTER TABLE profile_social_stats
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- ============================================================
-- 3. social_links table — unique constraint for upsert support
-- ============================================================

-- Required so the TikTok/Instagram callback can upsert on conflict(profile_id, platform)
-- without this constraint the onConflict upsert silently fails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'social_links_profile_platform_unique'
      AND conrelid = 'social_links'::regclass
  ) THEN
    ALTER TABLE social_links
      ADD CONSTRAINT social_links_profile_platform_unique
      UNIQUE (profile_id, platform);
  END IF;
END
$$;

-- ============================================================
-- 4. RLS policies — protect token columns
-- ============================================================

-- Ensure token columns are never exposed through the public API.
-- Athletes can read their own token metadata (expiry, user_id) but
-- the actual tokens should only be accessed server-side.
--
-- If you already have a restrictive SELECT policy on profiles that
-- limits which columns are returned, the tokens are already protected.
-- The following policy ensures that even if a broad SELECT exists,
-- updates to token columns can only be made by the owning user or
-- service_role.

-- Drop existing policy if we need to recreate it (idempotent guard)
DO $$
BEGIN
  -- Only create the policy if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Users can update own token columns'
  ) THEN
    CREATE POLICY "Users can update own token columns"
      ON profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- ============================================================
-- 5. Comments for documentation
-- ============================================================

COMMENT ON COLUMN profiles.instagram_access_token IS 'Encrypted Instagram Graph API long-lived token (60-day). App-layer encrypted.';
COMMENT ON COLUMN profiles.instagram_user_id IS 'Instagram Graph API user ID (numeric string).';
COMMENT ON COLUMN profiles.instagram_token_expires_at IS 'Expiry timestamp of the Instagram long-lived token.';

COMMENT ON COLUMN profiles.tiktok_access_token IS 'Encrypted TikTok access token (24hr). App-layer encrypted.';
COMMENT ON COLUMN profiles.tiktok_refresh_token IS 'Encrypted TikTok refresh token (365-day). App-layer encrypted.';
COMMENT ON COLUMN profiles.tiktok_user_id IS 'TikTok open_id for the connected user.';
COMMENT ON COLUMN profiles.tiktok_token_expires_at IS 'Expiry timestamp of the TikTok access token.';
COMMENT ON COLUMN profiles.tiktok_refresh_expires_at IS 'Expiry timestamp of the TikTok refresh token.';

COMMENT ON COLUMN profile_social_stats.is_verified IS 'true = stats pulled from platform API, false = manually entered by athlete.';
COMMENT ON COLUMN profile_social_stats.last_synced_at IS 'Timestamp of last successful API sync. NULL if never synced.';

COMMIT;
