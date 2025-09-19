import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
          high_score: number
          suspicious_activity_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          current_stage?: number
          total_taps?: number
          rug_meter?: number
          high_score?: number
          suspicious_activity_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          current_stage?: number
          total_taps?: number
          rug_meter?: number
          high_score?: number
          suspicious_activity_count?: number
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
