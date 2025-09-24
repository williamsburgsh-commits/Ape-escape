-- Fix shares_log table structure for APE ESCAPE
-- Run this in your Supabase SQL Editor

-- Create shares_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS shares_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'twitter', 'instagram')),
  url TEXT NOT NULL,
  ape_awarded INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add submitted_url column if it doesn't exist
ALTER TABLE shares_log ADD COLUMN IF NOT EXISTS submitted_url TEXT;

-- Update existing records to have submitted_url = url
UPDATE shares_log SET submitted_url = url WHERE submitted_url IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shares_log_user_id ON shares_log(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_log_platform ON shares_log(platform);
CREATE INDEX IF NOT EXISTS idx_shares_log_created_at ON shares_log(created_at);
CREATE INDEX IF NOT EXISTS idx_shares_log_status ON shares_log(status);

-- Enable RLS
ALTER TABLE shares_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own shares" ON shares_log;
DROP POLICY IF EXISTS "Users can insert their own shares" ON shares_log;

-- Create RLS Policies for shares_log
CREATE POLICY "Users can view their own shares" ON shares_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shares" ON shares_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Test insert to verify table works
INSERT INTO shares_log (user_id, platform, url, submitted_url, ape_awarded, status)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'twitter',
  'https://test.example.com',
  'https://test.example.com',
  30,
  'pending_review'
) ON CONFLICT DO NOTHING;

-- Clean up test record
DELETE FROM shares_log WHERE url = 'https://test.example.com';

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'shares_log' 
ORDER BY ordinal_position;
