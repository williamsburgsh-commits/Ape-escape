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
  sessionActiveTime: number // Total active play time in milliseconds
  lastActivityTime: number // Last time user was active
  isSessionActive: boolean // Whether session is currently active
  // APE Economy
  apeBalance: number
  consecutiveSlips: number
  lastLoginDate: string
  dailyApeEarned: number
  dailyTaps: number
  tragicHeroBadges: number
  insuranceActive: boolean
  insuranceTapsLeft: number
  // Revenge Mode
  revengeModeActive: boolean
  revengeModeEndTime: number
}

export interface GameMessage {
  id: string
  message: string
  timestamp: number
  type: 'anti-cheat' | 'slip' | 'stage-up' | 'info'
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
  ape_balance: number
  consecutive_slips: number
  last_login_date: string
  daily_ape_earned: number
  daily_taps: number
  tragic_hero_badges: number
  insurance_active: boolean
  insurance_taps_left: number
  revenge_mode_active: boolean
  revenge_mode_end_time: number
  referral_code: string
  referred_by: string | null
  total_referrals: number
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

// APE Economy Constants
export const APE_EARNINGS = {
  PER_STAGE_BASE: 5,
  PER_STAGE_MULTIPLIER: 5,
  DAILY_LOGIN: 5,
  DAILY_LOGIN_MAX: 50,
  DAILY_LOGIN_DAYS: 10,
  DAILY_CAP: 500,
  SLIP_COMPENSATION_BASE: 5,
  SLIP_COMPENSATION_MULTIPLIER: 10,
  CONSECUTIVE_SLIP_BONUS: 10,
  CONSECUTIVE_SLIP_MAX: 50,
  DAILY_GOALS: {
    500: 20,
    1000: 40
  }
} as const

export const APE_MILESTONES = {
  5: 50,
  10: 100,
  25: 250,
  50: 500,
  75: 750,
  100: 1500
} as const

export const APE_SPENDING = {
  SLIP_INSURANCE: 100,
  RESET_RUG_METER: 50
} as const

// Referral System Constants
export const REFERRAL_REWARDS = {
  NEW_USER: 15, // APE for new user when they use referral code
  REFERRER: 20, // APE for referrer when code is used
  STAGE_10_BONUS: 30, // APE for referrer when referee reaches stage 10
  GANG_THRESHOLD: 10 // Total referrals needed for gang
} as const


// APE Economy Functions
export const calculateStageApeReward = (stage: number): number => {
  return APE_EARNINGS.PER_STAGE_BASE + Math.floor(stage / 5) * APE_EARNINGS.PER_STAGE_MULTIPLIER
}

export const calculateSlipCompensation = (stagesLost: number): number => {
  return APE_EARNINGS.SLIP_COMPENSATION_BASE + (APE_EARNINGS.SLIP_COMPENSATION_MULTIPLIER * stagesLost)
}

export const calculateConsecutiveSlipBonus = (consecutiveSlips: number): number => {
  return Math.min(consecutiveSlips * APE_EARNINGS.CONSECUTIVE_SLIP_BONUS, APE_EARNINGS.CONSECUTIVE_SLIP_MAX)
}

export const getMilestoneReward = (stage: number): number => {
  return APE_MILESTONES[stage as keyof typeof APE_MILESTONES] || 0
}

// Referral System Functions
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'APE'
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const validateReferralCode = (code: string): boolean => {
  return /^APE[A-Z0-9]{5}$/.test(code)
}

// Social Sharing Types
export interface ShareLog {
  id: string
  user_id: string
  platform: 'tiktok' | 'twitter' | 'instagram'
  url: string
  ape_awarded: number
  created_at: string
}


// Revenge Mode Constants
export const REVENGE_MODE = {
  DURATION: 5000, // 5 seconds
  TAP_MULTIPLIER: 2, // 2x tap power
  VISUAL_EFFECT: 'red-glow' // Red glow effect
} as const


