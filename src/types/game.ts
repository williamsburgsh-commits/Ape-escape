export interface GameState {
  currentStage: number
  totalTaps: number
  rugMeter: number
  rugCount: number // Total number of slips/rugs that have occurred
  highScore: number
  lastTapTime: number
  tapCount: number
  isOffline: boolean
  lastSyncTime: number
  // Rug Meter system
  rugMeterProgress: number // 0-100, represents progress within current stage
  slipChance: number // 1-4% based on rug meter progress
  // Session tracking
  sessionTaps: number
  sessionSlips: number
  sessionStartTime: number
}

export interface SlipMessage {
  id: string
  message: string
  timestamp: number
}

export interface UserProfile {
  id: string
  username: string | null
  current_stage: number
  total_taps: number
  rug_meter: number
  rug_count: number
  high_score: number
  suspicious_activity_count: number
  created_at: string
  updated_at: string
}

export interface GameEvent {
  id?: string
  user_id: string
  event_type: 'tap' | 'slip' | 'stage_up'
  stage: number
  taps: number
  timestamp?: string
}

export const SLIP_MESSAGES = [
  "Whoops! Stepped on a banana peel! 🍌",
  "Gravity wins this round! 🦍",
  "The ape forgot how to ape! 🤪"
] as const

export const STAGE_FORMULA = (stage: number): number => {
  return Math.floor(40 * stage * Math.sqrt(stage))
}

export const RUG_METER_BASE_CHANCE = 0.01 // 1% base slip chance
export const RUG_METER_MAX_CHANCE = 0.04 // 4% max slip chance
export const RUG_METER_INCREASE_INTERVAL = 25 // Every 25 taps increases by 1%
export const RUG_METER_MAX_PROGRESS = 100 // Max progress percentage

export const MAX_TAPS_PER_SECOND = 10
export const MIN_TAP_INTERVAL = 150 // milliseconds
export const SUSPICIOUS_TAP_RATE = 15 // taps per second

// Rug Meter color zones
export const RUG_METER_ZONES = {
  SAFE: { min: 0, max: 50, color: 'green' }, // 1-2%
  WARNING: { min: 50, max: 75, color: 'yellow' }, // 2-3%
  DANGER: { min: 75, max: 100, color: 'red' } // 3-4%
} as const

// Partial setback rules
export const getPartialSetback = (stage: number, sessionSlips: number): number => {
  // After 2 slips in session, max 1 stage drop only
  if (sessionSlips >= 2) {
    return 1
  }
  
  if (stage >= 1 && stage <= 10) return 1
  if (stage >= 11 && stage <= 25) return Math.floor(Math.random() * 2) + 1 // 1-2
  if (stage >= 26 && stage <= 50) return Math.floor(Math.random() * 2) + 2 // 2-3
  return Math.floor(Math.random() * 2) + 3 // 3-4
}
