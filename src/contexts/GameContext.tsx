'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { GameState, GameMessage, SlipMessage, UserProfile, STAGE_FORMULA, RUG_METER_BASE_CHANCE, RUG_METER_MAX_CHANCE, RUG_METER_INCREASE_INTERVAL, RUG_METER_MAX_PROGRESS, getPartialSetback, MAX_TAPS_PER_SECOND, MIN_TAP_INTERVAL, SUSPICIOUS_TAP_RATE, SLIP_MESSAGES, calculateStageApeReward, calculateSlipCompensation, calculateConsecutiveSlipBonus, getMilestoneReward, APE_EARNINGS, APE_SPENDING, REFERRAL_REWARDS, validateReferralCode, REVENGE_MODE } from '@/types/game'

interface GameContextType {
  gameState: GameState
  user: UserProfile | null
  gameMessages: GameMessage[]
  slipMessages: SlipMessage[]
  isOnline: boolean
  handleTap: () => void
  syncGameState: () => Promise<void>
  setUser: (user: UserProfile | null) => void
  buyInsurance: () => void
  resetRugMeter: () => void
  resetSessionTime: () => void
  applyReferralCode: (code: string) => Promise<boolean>
  copyReferralCode: () => void
  // Revenge mode
  activateRevengeMode: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

type GameAction =
  | { type: 'TAP' }
  | { type: 'SLIP' }
  | { type: 'STAGE_UP' }
  | { type: 'PARTIAL_SETBACK'; payload: number }
  | { type: 'UPDATE_RUG_METER' }
  | { type: 'RESET_SESSION' }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SYNC_STATE'; payload: Partial<GameState> }
  | { type: 'ADD_GAME_MESSAGE'; payload: GameMessage }
  | { type: 'REMOVE_GAME_MESSAGE'; payload: string }
  | { type: 'ADD_SLIP_MESSAGE'; payload: SlipMessage }
  | { type: 'REMOVE_SLIP_MESSAGE'; payload: string }
  | { type: 'ADD_APE'; payload: number }
  | { type: 'SPEND_APE'; payload: number }
  | { type: 'BUY_INSURANCE' }
  | { type: 'RESET_RUG_METER' }
  | { type: 'AWARD_TRAGIC_HERO' }
  | { type: 'DAILY_LOGIN' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'UPDATE_ACTIVE_TIME' }
  | { type: 'RESET_SESSION_TIME' }
  | { type: 'USE_REFERRAL_CODE'; payload: { code: string; referrerId: string } }
  | { type: 'REFERRAL_BONUS'; payload: number }
  | { type: 'ACTIVATE_REVENGE_MODE' }
  | { type: 'DEACTIVATE_REVENGE_MODE' }

const initialState: GameState = {
  currentStage: 1,
  totalTaps: 0,
  rugMeter: 0,
  rugCount: 0,
  highScore: 0,
  lastTapTime: 0,
  tapCount: 0,
  isOffline: false,
  lastSyncTime: Date.now(),
  // Rug Meter system
  rugMeterProgress: 0,
  slipChance: RUG_METER_BASE_CHANCE,
  // Session tracking
  sessionTaps: 0,
  sessionSlips: 0,
  sessionStartTime: Date.now(),
  sessionActiveTime: 0,
  lastActivityTime: Date.now(),
  isSessionActive: true,
  // APE Economy
  apeBalance: 0,
  consecutiveSlips: 0,
  lastLoginDate: new Date().toISOString().split('T')[0],
  dailyApeEarned: 0,
  dailyTaps: 0,
  tragicHeroBadges: 0,
  insuranceActive: false,
  insuranceTapsLeft: 0,
  // Revenge Mode
  revengeModeActive: false,
  revengeModeEndTime: 0
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TAP': {
      const now = Date.now()
      const timeSinceLastTap = now - state.lastTapTime
      
      const newTotalTaps = state.totalTaps + 1
      const newRugMeter = state.rugMeter + 1
      const newHighScore = Math.max(state.highScore, newTotalTaps)
      const newSessionTaps = state.sessionTaps + 1
      const newDailyTaps = state.dailyTaps + 1
      
      const tapsToNextStage = STAGE_FORMULA(state.currentStage)
      const shouldStageUp = newRugMeter >= tapsToNextStage
      
      // Calculate new rug meter progress within current stage
      const newRugMeterProgress = shouldStageUp ? 0 : 
        Math.min(RUG_METER_MAX_PROGRESS, (newRugMeter % RUG_METER_INCREASE_INTERVAL) / RUG_METER_INCREASE_INTERVAL * 100)
      
      // Calculate slip chance based on rug meter progress
      const newSlipChance = Math.min(
        RUG_METER_MAX_CHANCE,
        RUG_METER_BASE_CHANCE + (Math.floor(newRugMeter / RUG_METER_INCREASE_INTERVAL) * 0.01)
      )
      
      // Calculate APE rewards
      let newApeBalance = state.apeBalance
      let newDailyApeEarned = state.dailyApeEarned
      
      if (shouldStageUp) {
        const stageReward = calculateStageApeReward(state.currentStage)
        const milestoneReward = getMilestoneReward(state.currentStage + 1)
        const totalReward = stageReward + milestoneReward
        
        // Check daily cap
        if (newDailyApeEarned + totalReward <= APE_EARNINGS.DAILY_CAP) {
          newApeBalance += totalReward
          newDailyApeEarned += totalReward
        }
      }
      
      // Check daily tap goals
      const dailyGoalReward = Object.entries(APE_EARNINGS.DAILY_GOALS)
        .filter(([goal]) => newDailyTaps >= parseInt(goal))
        .reduce((max, [, reward]) => Math.max(max, reward), 0)
      
      if (dailyGoalReward > 0 && newDailyApeEarned + dailyGoalReward <= APE_EARNINGS.DAILY_CAP) {
        newApeBalance += dailyGoalReward
        newDailyApeEarned += dailyGoalReward
      }
      
      // Update insurance taps if active
      let newInsuranceTapsLeft = state.insuranceTapsLeft
      if (state.insuranceActive && newInsuranceTapsLeft > 0) {
        newInsuranceTapsLeft -= 1
        if (newInsuranceTapsLeft === 0) {
          // Insurance expired
          return {
            ...state,
            totalTaps: newTotalTaps,
            rugMeter: shouldStageUp ? 0 : newRugMeter,
            currentStage: shouldStageUp ? state.currentStage + 1 : state.currentStage,
            highScore: newHighScore,
            lastTapTime: now,
            tapCount: timeSinceLastTap < 1000 ? state.tapCount + 1 : 1,
            rugMeterProgress: newRugMeterProgress,
            slipChance: newSlipChance,
            sessionTaps: newSessionTaps,
            dailyTaps: newDailyTaps,
            apeBalance: newApeBalance,
            dailyApeEarned: newDailyApeEarned,
            insuranceActive: false,
            insuranceTapsLeft: 0
          }
        }
      }
      
      return {
        ...state,
        totalTaps: newTotalTaps,
        rugMeter: shouldStageUp ? 0 : newRugMeter,
        currentStage: shouldStageUp ? state.currentStage + 1 : state.currentStage,
        highScore: newHighScore,
        lastTapTime: now,
        tapCount: timeSinceLastTap < 1000 ? state.tapCount + 1 : 1,
        rugMeterProgress: newRugMeterProgress,
        slipChance: newSlipChance,
        sessionTaps: newSessionTaps,
        dailyTaps: newDailyTaps,
        apeBalance: newApeBalance,
        dailyApeEarned: newDailyApeEarned,
        insuranceTapsLeft: newInsuranceTapsLeft
      }
    }
    case 'SLIP': {
      const newSessionSlips = state.sessionSlips + 1
      const newRugCount = state.rugCount + 1
      const newConsecutiveSlips = state.consecutiveSlips + 1
      const stagesToDrop = getPartialSetback(state.currentStage, state.sessionSlips)
      const newStage = Math.max(1, state.currentStage - stagesToDrop)
      const newRugMeter = Math.max(0, state.rugMeter - Math.floor(state.rugMeter * 0.1))
      
      // Reset rug meter progress and slip chance when slipping
      const newRugMeterProgress = 0
      const newSlipChance = RUG_METER_BASE_CHANCE
      
      // Calculate APE compensation
      const slipCompensation = calculateSlipCompensation(stagesToDrop)
      const consecutiveBonus = calculateConsecutiveSlipBonus(newConsecutiveSlips)
      const totalCompensation = slipCompensation + consecutiveBonus
      
      // Check for Tragic Hero (3 consecutive slips without progress)
      const shouldAwardTragicHero = newConsecutiveSlips >= 3 && newStage <= state.currentStage
      
      return {
        ...state,
        currentStage: newStage,
        rugMeter: newRugMeter,
        rugCount: newRugCount,
        rugMeterProgress: newRugMeterProgress,
        slipChance: newSlipChance,
        sessionSlips: newSessionSlips,
        consecutiveSlips: newConsecutiveSlips,
        apeBalance: state.apeBalance + totalCompensation,
        tragicHeroBadges: shouldAwardTragicHero ? state.tragicHeroBadges + 1 : state.tragicHeroBadges
      }
    }
    case 'STAGE_UP': {
      return {
        ...state,
        rugMeter: 0,
        rugMeterProgress: 0,
        slipChance: RUG_METER_BASE_CHANCE,
        consecutiveSlips: 0 // Reset consecutive slips on stage up
      }
    }
    case 'PARTIAL_SETBACK': {
      const newStage = Math.max(1, state.currentStage - action.payload)
      return {
        ...state,
        currentStage: newStage,
        rugMeter: 0,
        rugMeterProgress: 0,
        slipChance: RUG_METER_BASE_CHANCE
      }
    }
    case 'UPDATE_RUG_METER': {
      const newRugMeterProgress = Math.min(RUG_METER_MAX_PROGRESS, (state.rugMeter % RUG_METER_INCREASE_INTERVAL) / RUG_METER_INCREASE_INTERVAL * 100)
      const newSlipChance = Math.min(
        RUG_METER_MAX_CHANCE,
        RUG_METER_BASE_CHANCE + (Math.floor(state.rugMeter / RUG_METER_INCREASE_INTERVAL) * 0.01)
      )
      return {
        ...state,
        rugMeterProgress: newRugMeterProgress,
        slipChance: newSlipChance
      }
    }
    case 'RESET_SESSION': {
      return {
        ...state,
        sessionTaps: 0,
        sessionSlips: 0,
        sessionStartTime: Date.now(),
        sessionActiveTime: 0,
        lastActivityTime: Date.now(),
        isSessionActive: true
      }
    }
    case 'PAUSE_SESSION': {
      const now = Date.now()
      const timeSinceLastActivity = now - state.lastActivityTime
      const newActiveTime = state.sessionActiveTime + timeSinceLastActivity
      
      return {
        ...state,
        sessionActiveTime: newActiveTime,
        isSessionActive: false
      }
    }
    case 'RESUME_SESSION': {
      return {
        ...state,
        lastActivityTime: Date.now(),
        isSessionActive: true
      }
    }
    case 'UPDATE_ACTIVE_TIME': {
      const now = Date.now()
      const timeSinceLastActivity = now - state.lastActivityTime
      const newActiveTime = state.sessionActiveTime + timeSinceLastActivity
      
      return {
        ...state,
        sessionActiveTime: newActiveTime,
        lastActivityTime: now
      }
    }
    case 'RESET_SESSION_TIME': {
      return {
        ...state,
        sessionActiveTime: 0,
        lastActivityTime: Date.now(),
        isSessionActive: true
      }
    }
    case 'USE_REFERRAL_CODE': {
      return {
        ...state,
        apeBalance: state.apeBalance + REFERRAL_REWARDS.NEW_USER
      }
    }
    case 'REFERRAL_BONUS': {
      return {
        ...state,
        apeBalance: state.apeBalance + action.payload
      }
    }
    case 'ACTIVATE_REVENGE_MODE':
      return {
        ...state,
        revengeModeActive: true,
        revengeModeEndTime: Date.now() + REVENGE_MODE.DURATION
      }
    case 'DEACTIVATE_REVENGE_MODE':
      return {
        ...state,
        revengeModeActive: false,
        revengeModeEndTime: 0
      }
    case 'SET_USER':
      return {
        ...state,
        ...(action.payload && {
          currentStage: action.payload.current_stage,
          totalTaps: action.payload.total_taps,
          rugMeter: action.payload.rug_meter,
          rugCount: action.payload.rug_count || 0,
          highScore: action.payload.high_score,
          apeBalance: action.payload.ape_balance || 0,
          consecutiveSlips: action.payload.consecutive_slips || 0,
          lastLoginDate: action.payload.last_login_date || new Date().toISOString().split('T')[0],
          dailyApeEarned: action.payload.daily_ape_earned || 0,
          dailyTaps: action.payload.daily_taps || 0,
          tragicHeroBadges: action.payload.tragic_hero_badges || 0,
          insuranceActive: action.payload.insurance_active || false,
          insuranceTapsLeft: action.payload.insurance_taps_left || 0
        })
      }
    case 'SET_OFFLINE':
      return {
        ...state,
        isOffline: action.payload
      }
    case 'SYNC_STATE':
      return {
        ...state,
        ...action.payload
      }
    case 'ADD_APE':
      return {
        ...state,
        apeBalance: state.apeBalance + action.payload
      }
    case 'SPEND_APE':
      return {
        ...state,
        apeBalance: Math.max(0, state.apeBalance - action.payload)
      }
    case 'BUY_INSURANCE':
      return {
        ...state,
        apeBalance: state.apeBalance - APE_SPENDING.SLIP_INSURANCE,
        insuranceActive: true,
        insuranceTapsLeft: 50
      }
    case 'RESET_RUG_METER':
      return {
        ...state,
        apeBalance: state.apeBalance - APE_SPENDING.RESET_RUG_METER,
        // Only reset risk-related fields, NOT rugMeter (stage progress)
        rugMeterProgress: 0,
        slipChance: RUG_METER_BASE_CHANCE
      }
    case 'AWARD_TRAGIC_HERO':
      return {
        ...state,
        tragicHeroBadges: state.tragicHeroBadges + 1
      }
    case 'DAILY_LOGIN': {
      const today = new Date().toISOString().split('T')[0]
      if (state.lastLoginDate !== today) {
        const loginReward = Math.min(APE_EARNINGS.DAILY_LOGIN, APE_EARNINGS.DAILY_LOGIN_MAX)
        return {
          ...state,
          lastLoginDate: today,
          apeBalance: state.apeBalance + loginReward,
          dailyApeEarned: 0,
          dailyTaps: 0
        }
      }
      return state
    }
    case 'ADD_GAME_MESSAGE':
    case 'REMOVE_GAME_MESSAGE':
    case 'ADD_SLIP_MESSAGE':
    case 'REMOVE_SLIP_MESSAGE':
      // These are handled in the component state, not in the reducer
      return state
    default:
      return state
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [gameMessages, setGameMessages] = React.useState<GameMessage[]>([])
  const [slipMessages] = React.useState<SlipMessage[]>([])
  const [isOnline, setIsOnline] = React.useState(true)

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('ape-escape-game-state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        dispatch({ type: 'SYNC_STATE', payload: parsed })
      } catch (error) {
        console.error('Failed to load game state from localStorage:', error)
      }
    }
  }, [])

  // Save game state to localStorage on every change
  useEffect(() => {
    localStorage.setItem('ape-escape-game-state', JSON.stringify(gameState))
  }, [gameState])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      dispatch({ type: 'SET_OFFLINE', payload: false })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      dispatch({ type: 'SET_OFFLINE', payload: true })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addGameMessage = useCallback((message: string, type: 'anti-cheat' | 'slip' | 'stage-up' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    const gameMessage: GameMessage = {
      id,
      message,
      timestamp: Date.now(),
      type
    }
    
    setGameMessages(prev => [...prev, gameMessage])
    
    // Remove message after 3 seconds
    setTimeout(() => {
      setGameMessages(prev => prev.filter(msg => msg.id !== id))
    }, 3000)
  }, [])


  const syncGameState = useCallback(async () => {
    if (!user || !isOnline) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          current_stage: gameState.currentStage,
          total_taps: gameState.totalTaps,
          rug_meter: gameState.rugMeter,
          rug_count: gameState.rugCount,
          high_score: gameState.highScore,
          ape_balance: gameState.apeBalance,
          consecutive_slips: gameState.consecutiveSlips,
          last_login_date: gameState.lastLoginDate,
          daily_ape_earned: gameState.dailyApeEarned,
          daily_taps: gameState.dailyTaps,
          tragic_hero_badges: gameState.tragicHeroBadges,
          insurance_active: gameState.insuranceActive,
          insurance_taps_left: gameState.insuranceTapsLeft,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Log game event
      await supabase
        .from('game_events')
        .insert({
          user_id: user.id,
          event_type: 'tap',
          stage: gameState.currentStage,
          taps: gameState.totalTaps
        })

    } catch (error) {
      console.error('Failed to sync game state:', error)
    }
  }, [user, isOnline, gameState])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      syncGameState()
    }
  }, [isOnline, user, syncGameState])

  // Session management - pause when tab is hidden or offline
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch({ type: 'PAUSE_SESSION' })
      } else {
        dispatch({ type: 'RESUME_SESSION' })
      }
    }

    const handleOffline = () => {
      dispatch({ type: 'PAUSE_SESSION' })
    }

    const handleOnline = () => {
      dispatch({ type: 'RESUME_SESSION' })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Update active time every 5 seconds when session is active
  useEffect(() => {
    if (!gameState.isSessionActive) return

    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_ACTIVE_TIME' })
    }, 5000)

    return () => clearInterval(interval)
  }, [gameState.isSessionActive])

  // Wellness checks - show break reminders
  useEffect(() => {
    const activeTimeMinutes = Math.floor(gameState.sessionActiveTime / 60000)
    
    if (activeTimeMinutes === 30) {
      addGameMessage("⏰ 30 minutes played! Consider taking a short break! 🧘‍♂️", 'info')
    } else if (activeTimeMinutes === 45) {
      addGameMessage("⚠️ 45 minutes played! Time for a longer break! 🚶‍♂️", 'info')
    } else if (activeTimeMinutes === 60) {
      addGameMessage("🛑 1 hour played! Please take a mandatory break! Your health matters! 💚", 'info')
    }
  }, [gameState.sessionActiveTime, addGameMessage])


  const handleTap = useCallback(async () => {
    const now = Date.now()
    const timeSinceLastTap = now - gameState.lastTapTime
    
    // Anti-cheat: Check tap rate
    if (timeSinceLastTap < MIN_TAP_INTERVAL) {
      addGameMessage("Slow down there, speed demon! 🏃‍♂️", 'anti-cheat')
      return
    }
    
    const tapsPerSecond = timeSinceLastTap < 1000 ? gameState.tapCount + 1 : 1
    if (tapsPerSecond > MAX_TAPS_PER_SECOND) {
      addGameMessage("Slow down there, speed demon! 🏃‍♂️", 'anti-cheat')
      return
    }

    // Check if revenge mode is active and has expired
    if (gameState.revengeModeActive && now > gameState.revengeModeEndTime) {
      dispatch({ type: 'DEACTIVATE_REVENGE_MODE' })
    }

    // Check for slip using dynamic Rug Meter
    if (Math.random() < gameState.slipChance) {
      dispatch({ type: 'SLIP' })
      const randomMessage = SLIP_MESSAGES[Math.floor(Math.random() * SLIP_MESSAGES.length)]
      addGameMessage(randomMessage, 'slip')
      
      
      return
    }

    // Process tap with revenge mode multiplier
    const oldStage = gameState.currentStage
    const tapsToNextStage = STAGE_FORMULA(oldStage)
    const revengeMultiplier = gameState.revengeModeActive ? REVENGE_MODE.TAP_MULTIPLIER : 1
    const shouldStageUp = (gameState.rugMeter + revengeMultiplier) >= tapsToNextStage
    
    // Apply revenge mode multiplier to tap count
    for (let i = 0; i < revengeMultiplier; i++) {
      dispatch({ type: 'TAP' })
    }
    
    // Check if stage increased
    if (shouldStageUp) {
      dispatch({ type: 'STAGE_UP' })
      addGameMessage(`Stage Up! Evolved to Stage ${oldStage + 1}! 🎉`, 'stage-up')
      
      
      // Check for stage 10 referral bonus
      if ((oldStage + 1) === 10 && user?.referred_by) {
        // Award bonus to referrer
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              ape_balance: user.ape_balance + REFERRAL_REWARDS.STAGE_10_BONUS
            })
            .eq('id', user.referred_by)

          if (!error) {
            addGameMessage(`Stage 10 reached! Your referrer got +${REFERRAL_REWARDS.STAGE_10_BONUS} APE bonus! 🎁`, 'stage-up')
          }
        } catch (error) {
          console.error('Failed to award stage 10 bonus:', error)
        }
      }
    }

    // Log suspicious activity
    if (tapsPerSecond > SUSPICIOUS_TAP_RATE && user) {
      console.warn('Suspicious tap rate detected:', tapsPerSecond)
      // TODO: Log to server
    }

    // Sync with server if online
    if (isOnline && user) {
      syncGameState()
    }
  }, [gameState, user, isOnline, addGameMessage, syncGameState])

  const buyInsurance = useCallback(() => {
    if (gameState.apeBalance >= APE_SPENDING.SLIP_INSURANCE && !gameState.insuranceActive) {
      dispatch({ type: 'BUY_INSURANCE' })
      addGameMessage("Insurance activated! Protected for 50 taps! 🛡️", 'info')
    } else if (gameState.insuranceActive) {
      addGameMessage("Insurance already active! 🛡️", 'info')
    } else {
      addGameMessage("Not enough APE! Need 100 APE for insurance! 💰", 'info')
    }
  }, [gameState.apeBalance, gameState.insuranceActive, addGameMessage])

  const resetRugMeter = useCallback(() => {
    if (gameState.apeBalance >= APE_SPENDING.RESET_RUG_METER && gameState.slipChance > 0.01) {
      dispatch({ type: 'RESET_RUG_METER' })
      addGameMessage("Rug meter reset! Risk back to 1%! 🔄", 'info')
    } else if (gameState.slipChance <= 0.01) {
      addGameMessage("Rug meter already at minimum risk! ✅", 'info')
    } else {
      addGameMessage("Not enough APE! Need 50 APE to reset risk! 💰", 'info')
    }
  }, [gameState.apeBalance, gameState.slipChance, addGameMessage])

  const resetSessionTime = useCallback(() => {
    dispatch({ type: 'RESET_SESSION_TIME' })
    addGameMessage("Session time reset! Starting fresh! ⏰", 'info')
  }, [addGameMessage])

  const applyReferralCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user || !isOnline) {
      addGameMessage("Must be online to use referral codes! 🌐", 'info')
      return false
    }

    if (!validateReferralCode(code)) {
      addGameMessage("Invalid referral code format! Use APE followed by 5 characters! ❌", 'info')
      return false
    }

    try {
      // Check if user already has a referrer
      if (user.referred_by) {
        addGameMessage("You already used a referral code! 🚫", 'info')
        return false
      }

      // Find the referrer
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id, username, ape_balance, total_referrals')
        .eq('referral_code', code)
        .single()

      if (referrerError || !referrer) {
        addGameMessage("Referral code not found! Check the code and try again! 🔍", 'info')
        return false
      }

      // Prevent self-referral
      if (referrer.id === user.id) {
        addGameMessage("You can't refer yourself! 😅", 'info')
        return false
      }

      // Update user's referred_by field
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referred_by: referrer.id })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Award APE to new user
      dispatch({ type: 'USE_REFERRAL_CODE', payload: { code, referrerId: referrer.id } })
      addGameMessage(`Referral code used! +${REFERRAL_REWARDS.NEW_USER} APE! 🎉`, 'stage-up')

      // Award APE to referrer
      const newTotalReferrals = referrer.total_referrals + 1
      const { error: referrerUpdateError } = await supabase
        .from('profiles')
        .update({ 
          ape_balance: referrer.ape_balance + REFERRAL_REWARDS.REFERRER,
          total_referrals: newTotalReferrals
        })
        .eq('id', referrer.id)

      if (referrerUpdateError) throw referrerUpdateError

      // Check if referrer became a gang leader
      if (newTotalReferrals === REFERRAL_REWARDS.GANG_THRESHOLD) {
        addGameMessage(`🎉 ${referrer.username} just became a Gang Leader with ${newTotalReferrals} referrals! 👑`, 'stage-up')
      }

      // Update local user state
      setUser({ ...user, referred_by: referrer.id })

      addGameMessage(`Referred by ${referrer.username}! Welcome to the gang! 🦍`, 'info')
      return true

    } catch (error) {
      console.error('Failed to use referral code:', error)
      addGameMessage("Failed to use referral code! Try again later! ⚠️", 'info')
      return false
    }
  }, [user, isOnline, addGameMessage, setUser])

  const copyReferralCode = useCallback(() => {
    if (!user?.referral_code) {
      addGameMessage("No referral code available! 🔍", 'info')
      return
    }

    navigator.clipboard.writeText(user.referral_code)
    addGameMessage(`Referral code copied! Share ${user.referral_code} with friends! 📋`, 'info')
  }, [user, addGameMessage])





  // Revenge mode functions
  const activateRevengeMode = useCallback(() => {
    dispatch({ type: 'ACTIVATE_REVENGE_MODE' })
    addGameMessage('REVENGE MODE ACTIVATED! 2x tap power for 5 seconds! 🔥', 'stage-up')
    
    // Auto-deactivate after duration
    setTimeout(() => {
      dispatch({ type: 'DEACTIVATE_REVENGE_MODE' })
      addGameMessage('Revenge mode ended. Back to normal tapping! 💪', 'info')
    }, REVENGE_MODE.DURATION)
  }, [addGameMessage])







  const contextValue: GameContextType = {
    gameState,
    user,
    gameMessages,
    slipMessages,
    isOnline,
    handleTap,
    syncGameState,
    setUser,
    buyInsurance,
    resetRugMeter,
    resetSessionTime,
    applyReferralCode,
    copyReferralCode,
    activateRevengeMode
  }

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
