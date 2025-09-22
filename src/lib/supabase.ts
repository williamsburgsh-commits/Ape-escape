import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          current_stage: number
          total_taps: number
          rug_meter: number
          rug_count: number
          high_score: number
          suspicious_activity_count: number
          ape_balance: number
          consecutive_slips: number
          last_login_date: string
          daily_ape_earned: number
          daily_taps: number
          tragic_hero_badges: number
          insurance_active: boolean
          insurance_taps_left: number
          referral_code: string
          referred_by: string | null
          total_referrals: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          current_stage?: number
          total_taps?: number
          rug_meter?: number
          rug_count?: number
          high_score?: number
          suspicious_activity_count?: number
          ape_balance?: number
          consecutive_slips?: number
          last_login_date?: string
          daily_ape_earned?: number
          daily_taps?: number
          tragic_hero_badges?: number
          insurance_active?: boolean
          insurance_taps_left?: number
          referral_code?: string
          referred_by?: string | null
          total_referrals?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          current_stage?: number
          total_taps?: number
          rug_meter?: number
          rug_count?: number
          high_score?: number
          suspicious_activity_count?: number
          ape_balance?: number
          consecutive_slips?: number
          last_login_date?: string
          daily_ape_earned?: number
          daily_taps?: number
          tragic_hero_badges?: number
          insurance_active?: boolean
          insurance_taps_left?: number
          referral_code?: string
          referred_by?: string | null
          total_referrals?: number
          created_at?: string
          updated_at?: string
        }
      }
      game_events: {
        Row: {
          id: string
          user_id: string
          event_type: 'tap' | 'slip' | 'stage_up'
          stage: number
          taps: number
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: 'tap' | 'slip' | 'stage_up'
          stage: number
          taps: number
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: 'tap' | 'slip' | 'stage_up'
          stage?: number
          taps?: number
          timestamp?: string
        }
      }
    }
  }
}
