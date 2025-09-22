-- Fix referral code functionality by adding proper RLS policies
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'game_events')
ORDER BY tablename, policyname;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own game events" ON game_events;
DROP POLICY IF EXISTS "Users can insert their own game events" ON game_events;

-- Recreate profiles policies with proper referral code access
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to search for profiles by referral code (needed for referral system)
CREATE POLICY "Users can search by referral code" ON profiles
  FOR SELECT USING (referral_code IS NOT NULL);

-- Recreate game_events policies
CREATE POLICY "Users can view their own game events" ON game_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game events" ON game_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
