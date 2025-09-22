-- Run this SQL in your Supabase SQL Editor to update the database schema

-- First, let's check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- If the table doesn't have the expected columns, run the full schema update below
-- (This is the same as supabase-schema.sql but with some modifications for existing tables)

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own game events" ON game_events;
DROP POLICY IF EXISTS "Users can insert their own game events" ON game_events;

-- Drop existing triggers
DROP TRIGGER IF EXISTS set_referral_code_trigger ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS set_referral_code();
DROP FUNCTION IF EXISTS update_updated_at_column();

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_current_stage ON profiles(current_stage);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_game_events_user_id ON game_events(user_id);
CREATE INDEX IF NOT EXISTS idx_game_events_timestamp ON game_events(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for game_events
CREATE POLICY "Users can view their own game events" ON game_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game events" ON game_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'APE' || array_to_string(
      ARRAY(
        SELECT substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 
                     (random() * 36)::int + 1, 1)
        FROM generate_series(1, 5)
      ), ''
    );
    
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ language 'plpgsql';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to set referral code on profile creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically generate referral code
CREATE TRIGGER set_referral_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
