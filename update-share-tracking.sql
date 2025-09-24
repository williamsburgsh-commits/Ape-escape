-- Update database schema for enhanced share tracking
-- Run this in your Supabase SQL Editor

-- 1. Add share tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ape_from_shares INTEGER DEFAULT 0;

-- 2. Update the get_user_share_stats function to include total stats
CREATE OR REPLACE FUNCTION get_user_share_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  daily_count INTEGER;
  total_shares INTEGER;
  total_ape INTEGER;
  cooldowns JSON;
  platform_cooldowns JSON;
BEGIN
  -- Get today's share count
  SELECT COUNT(*) INTO daily_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE;
  
  -- Get total shares and APE earned
  SELECT 
    COUNT(*),
    COALESCE(SUM(ape_awarded), 0)
  INTO total_shares, total_ape
  FROM shares_log
  WHERE user_id = p_user_id;
  
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
    'cooldowns', cooldowns,
    'totalShares', total_shares,
    'totalApeEarned', total_ape
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update the award_share_ape function to update total stats
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
  
  -- Update user's APE balance and share stats
  UPDATE profiles 
  SET 
    ape_balance = ape_balance + ape_reward,
    total_shares = total_shares + 1,
    total_ape_from_shares = total_ape_from_shares + ape_reward
  WHERE id = p_user_id;
  
  RETURN ape_reward;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create function to get platform cooldown time remaining
CREATE OR REPLACE FUNCTION get_platform_cooldown_remaining(
  p_user_id UUID,
  p_platform TEXT
)
RETURNS INTERVAL AS $$
DECLARE
  last_share_time TIMESTAMP WITH TIME ZONE;
  cooldown_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MAX(created_at) INTO last_share_time
  FROM shares_log
  WHERE user_id = p_user_id AND platform = p_platform;
  
  IF last_share_time IS NULL THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  cooldown_end_time := last_share_time + INTERVAL '8 hours';
  
  IF cooldown_end_time <= NOW() THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  RETURN cooldown_end_time - NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create function to get next daily reset time
CREATE OR REPLACE FUNCTION get_next_daily_reset()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Show updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('total_shares', 'total_ape_from_shares')
ORDER BY ordinal_position;

-- 7. Show updated functions
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%share%'
ORDER BY routine_name;

