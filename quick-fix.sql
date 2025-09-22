-- Quick fix: Just add the missing columns to your existing profiles table
-- Run this in your Supabase SQL Editor

-- Add missing columns to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rug_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ape_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consecutive_slips INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS daily_ape_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_taps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tragic_hero_badges INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS insurance_taps_left INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create game_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('tap', 'slip', 'stage_up')),
  stage INTEGER NOT NULL,
  taps INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own game events" ON game_events;
DROP POLICY IF EXISTS "Users can insert their own game events" ON game_events;

-- Add RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own game events" ON game_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game events" ON game_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
