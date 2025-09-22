-- Social Sharing System Database Schema
-- Run this in your Supabase SQL Editor

-- Create shares_log table for tracking shares and preventing abuse
CREATE TABLE IF NOT EXISTS shares_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'twitter', 'instagram')),
  url TEXT NOT NULL UNIQUE,
  ape_awarded INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shares_log_user_id ON shares_log(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_log_platform ON shares_log(platform);
CREATE INDEX IF NOT EXISTS idx_shares_log_created_at ON shares_log(created_at);
CREATE INDEX IF NOT EXISTS idx_shares_log_url ON shares_log(url);

-- Enable RLS
ALTER TABLE shares_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shares_log
CREATE POLICY "Users can view their own shares" ON shares_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shares" ON shares_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check if user can share on a platform (anti-abuse)
CREATE OR REPLACE FUNCTION can_share_on_platform(
  p_user_id UUID,
  p_platform TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  last_share_time TIMESTAMP WITH TIME ZONE;
  daily_share_count INTEGER;
BEGIN
  -- Check 8-hour cooldown
  SELECT MAX(created_at) INTO last_share_time
  FROM shares_log
  WHERE user_id = p_user_id AND platform = p_platform;
  
  IF last_share_time IS NOT NULL AND 
     last_share_time > NOW() - INTERVAL '8 hours' THEN
    RETURN FALSE;
  END IF;
  
  -- Check daily limit (3 shares per day)
  SELECT COUNT(*) INTO daily_share_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE;
  
  IF daily_share_count >= 3 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if URL has been used before
CREATE OR REPLACE FUNCTION is_url_used(p_url TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  url_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM shares_log WHERE url = p_url) INTO url_exists;
  RETURN url_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to validate platform URL
CREATE OR REPLACE FUNCTION validate_platform_url(
  p_url TEXT,
  p_platform TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE p_platform
    WHEN 'twitter' THEN
      RETURN p_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/';
    WHEN 'tiktok' THEN
      RETURN p_url ~* '^https?://(www\.)?tiktok\.com/';
    WHEN 'instagram' THEN
      RETURN p_url ~* '^https?://(www\.)?instagram\.com/';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to award APE for verified share
CREATE OR REPLACE FUNCTION award_share_ape(
  p_user_id UUID,
  p_platform TEXT,
  p_url TEXT
)
RETURNS INTEGER AS $$
DECLARE
  ape_reward INTEGER;
  daily_count INTEGER;
BEGIN
  -- Check if user can still share today
  SELECT COUNT(*) INTO daily_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE;
  
  IF daily_count >= 3 THEN
    RAISE EXCEPTION 'Daily share limit reached';
  END IF;
  
  -- Check 8-hour cooldown for this platform
  IF NOT can_share_on_platform(p_user_id, p_platform) THEN
    RAISE EXCEPTION 'Platform cooldown active';
  END IF;
  
  -- Check if URL already used
  IF is_url_used(p_url) THEN
    RAISE EXCEPTION 'URL already used';
  END IF;
  
  -- Validate platform URL
  IF NOT validate_platform_url(p_url, p_platform) THEN
    RAISE EXCEPTION 'Invalid platform URL';
  END IF;
  
  -- Calculate APE reward based on platform
  CASE p_platform
    WHEN 'tiktok' THEN ape_reward := 45;  -- 3x multiplier
    WHEN 'twitter' THEN ape_reward := 30; -- 2x multiplier
    WHEN 'instagram' THEN ape_reward := 22; -- 1.5x multiplier
    ELSE ape_reward := 0;
  END CASE;
  
  -- Insert share record
  INSERT INTO shares_log (user_id, platform, url, ape_awarded)
  VALUES (p_user_id, p_platform, p_url, ape_reward);
  
  -- Update user's APE balance
  UPDATE profiles 
  SET ape_balance = ape_balance + ape_reward
  WHERE id = p_user_id;
  
  RETURN ape_reward;
END;
$$ LANGUAGE plpgsql;
