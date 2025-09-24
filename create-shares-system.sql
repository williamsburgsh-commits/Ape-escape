-- Create complete social sharing system for APE ESCAPE
-- Run this in your Supabase SQL Editor

-- 1. Create shares_log table
CREATE TABLE IF NOT EXISTS shares_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'twitter', 'instagram')),
  url TEXT NOT NULL,
  ape_awarded INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shares_log_user_id ON shares_log(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_log_platform ON shares_log(platform);
CREATE INDEX IF NOT EXISTS idx_shares_log_created_at ON shares_log(created_at);
CREATE INDEX IF NOT EXISTS idx_shares_log_status ON shares_log(status);
CREATE INDEX IF NOT EXISTS idx_shares_log_url ON shares_log(url);

-- 3. Enable RLS
ALTER TABLE shares_log ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for shares_log
CREATE POLICY "Users can view their own shares" ON shares_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shares" ON shares_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Function to check daily share limits
CREATE OR REPLACE FUNCTION check_daily_share_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO daily_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE;
  
  RETURN daily_count < 3; -- Max 3 shares per day
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Function to check platform cooldown
CREATE OR REPLACE FUNCTION check_platform_cooldown(
  p_user_id UUID,
  p_platform TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  last_share_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MAX(created_at) INTO last_share_time
  FROM shares_log
  WHERE user_id = p_user_id AND platform = p_platform;
  
  IF last_share_time IS NULL THEN
    RETURN TRUE; -- No previous shares
  END IF;
  
  -- Check if 8 hours have passed
  RETURN last_share_time < NOW() - INTERVAL '8 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Function to validate platform URL
CREATE OR REPLACE FUNCTION validate_platform_url(
  p_url TEXT,
  p_platform TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  url_hostname TEXT;
BEGIN
  -- Extract hostname from URL
  url_hostname := LOWER(SPLIT_PART(SPLIT_PART(p_url, '://', 2), '/', 1));
  
  -- Validate based on platform
  CASE p_platform
    WHEN 'twitter' THEN
      RETURN url_hostname IN ('twitter.com', 'x.com', 'www.twitter.com', 'www.x.com');
    WHEN 'tiktok' THEN
      RETURN url_hostname IN ('tiktok.com', 'www.tiktok.com', 'vm.tiktok.com');
    WHEN 'instagram' THEN
      RETURN url_hostname IN ('instagram.com', 'www.instagram.com');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Function to award APE for verified share
CREATE OR REPLACE FUNCTION award_share_ape(
  p_user_id UUID,
  p_platform TEXT,
  p_url TEXT
)
RETURNS INTEGER AS $$
DECLARE
  ape_reward INTEGER;
  daily_count INTEGER;
  last_share_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check daily limit
  IF NOT check_daily_share_limit(p_user_id) THEN
    RAISE EXCEPTION 'Daily share limit reached (3 shares per day)';
  END IF;
  
  -- Check platform cooldown
  IF NOT check_platform_cooldown(p_user_id, p_platform) THEN
    RAISE EXCEPTION 'Platform cooldown active (8 hours between same platform shares)';
  END IF;
  
  -- Validate platform URL
  IF NOT validate_platform_url(p_url, p_platform) THEN
    RAISE EXCEPTION 'Invalid platform URL';
  END IF;
  
  -- Check if URL already used
  IF EXISTS(SELECT 1 FROM shares_log WHERE url = p_url) THEN
    RAISE EXCEPTION 'URL already used';
  END IF;
  
  -- Calculate APE reward based on platform
  CASE p_platform
    WHEN 'tiktok' THEN ape_reward := 45; -- 3x multiplier
    WHEN 'twitter' THEN ape_reward := 30; -- 2x multiplier
    WHEN 'instagram' THEN ape_reward := 22; -- 1.5x multiplier
    ELSE ape_reward := 0;
  END CASE;
  
  -- Insert share record
  INSERT INTO shares_log (user_id, platform, url, ape_awarded, status)
  VALUES (p_user_id, p_platform, p_url, ape_reward, 'pending_review');
  
  -- Update user's APE balance
  UPDATE profiles 
  SET ape_balance = ape_balance + ape_reward
  WHERE id = p_user_id;
  
  RETURN ape_reward;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Function to get user share stats
CREATE OR REPLACE FUNCTION get_user_share_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  daily_count INTEGER;
  cooldowns JSON;
  platform_cooldowns JSON;
BEGIN
  -- Get today's share count
  SELECT COUNT(*) INTO daily_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE;
  
  -- Get platform cooldowns
  SELECT json_object_agg(
    platform,
    CASE 
      WHEN MAX(created_at) > NOW() - INTERVAL '8 hours' THEN true
      ELSE false
    END
  ) INTO platform_cooldowns
  FROM shares_log
  WHERE user_id = p_user_id
  GROUP BY platform;
  
  -- Build result
  cooldowns := COALESCE(platform_cooldowns, '{}'::json);
  
  RETURN json_build_object(
    'dailyShares', daily_count,
    'cooldowns', cooldowns
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Test the system
INSERT INTO shares_log (user_id, platform, url, ape_awarded, status)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'twitter',
  'https://x.com/test123',
  30,
  'pending_review'
) ON CONFLICT DO NOTHING;

-- 11. Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'shares_log' 
ORDER BY ordinal_position;

-- 12. Show created functions
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%share%'
ORDER BY routine_name;
