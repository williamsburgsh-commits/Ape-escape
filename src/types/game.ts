export interface GameState {
  currentStage: number
  totalTaps: number
  rugMeter: number
  highScore: number
  lastTapTime: number
  tapCount: number
  isOffline: boolean
  lastSyncTime: number
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

export const SLIP_CHANCE = 0.02 // 2%
export const MAX_TAPS_PER_SECOND = 10
export const MIN_TAP_INTERVAL = 150 // milliseconds
export const SUSPICIOUS_TAP_RATE = 15 // taps per second
