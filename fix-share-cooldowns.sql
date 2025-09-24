-- Fix share cooldown logic to use 8-hour platform cooldowns instead of midnight reset
-- Run this in your Supabase SQL Editor

-- 1. Update the check_daily_share_limit function to use 24-hour rolling window
CREATE OR REPLACE FUNCTION check_daily_share_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  -- Count shares in the last 24 hours (rolling window, not midnight reset)
  SELECT COUNT(*) INTO daily_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  RETURN daily_count < 3; -- Max 3 shares per 24-hour rolling window
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update the check_platform_cooldown function to use 8-hour rolling window
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
    RETURN TRUE; -- No previous shares on this platform
  END IF;
  
  -- Check if 8 hours have passed since last share on this platform
  RETURN last_share_time < NOW() - INTERVAL '8 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update the get_user_share_stats function to use rolling windows
CREATE OR REPLACE FUNCTION get_user_share_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  daily_count INTEGER;
  total_shares INTEGER;
  total_ape INTEGER;
  cooldowns JSON;
  platform_cooldowns JSON;
  platform_times JSON;
BEGIN
  -- Get shares in the last 24 hours (rolling window)
  SELECT COUNT(*) INTO daily_count
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Get total shares and APE earned
  SELECT 
    COUNT(*),
    COALESCE(SUM(ape_awarded), 0)
  INTO total_shares, total_ape
  FROM shares_log
  WHERE user_id = p_user_id;
  
  -- Get platform cooldowns with remaining time
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
  
  -- Get platform cooldown times
  SELECT json_object_agg(
    platform,
    EXTRACT(EPOCH FROM (MAX(created_at) + INTERVAL '8 hours' - NOW()))::INTEGER
  ) INTO platform_times
  FROM shares_log
  WHERE user_id = p_user_id
    AND MAX(created_at) > NOW() - INTERVAL '8 hours'
  GROUP BY platform;
  
  -- Build result
  cooldowns := COALESCE(platform_cooldowns, '{}'::json);
  
  RETURN json_build_object(
    'dailyShares', daily_count,
    'cooldowns', cooldowns,
    'cooldownTimes', COALESCE(platform_times, '{}'::json),
    'totalShares', total_shares,
    'totalApeEarned', total_ape
  );
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

-- 5. Create function to get next daily reset time (24 hours from first share today)
CREATE OR REPLACE FUNCTION get_next_daily_reset(p_user_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  first_share_today TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MIN(created_at) INTO first_share_today
  FROM shares_log
  WHERE user_id = p_user_id 
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  IF first_share_today IS NULL THEN
    RETURN NOW(); -- No shares today, can share now
  END IF;
  
  RETURN first_share_today + INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Test the updated functions
SELECT 'Functions updated successfully' as status;

-- 7. Show updated functions
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%share%'
ORDER BY routine_name;
