'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { GameState, SlipMessage, UserProfile, GameEvent, STAGE_FORMULA, SLIP_CHANCE, MAX_TAPS_PER_SECOND, MIN_TAP_INTERVAL, SUSPICIOUS_TAP_RATE, SLIP_MESSAGES } from '@/types/game'

interface GameContextType {
  gameState: GameState
  user: UserProfile | null
  slipMessages: SlipMessage[]
  isOnline: boolean
  handleTap: () => void
  syncGameState: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

type GameAction =
  | { type: 'TAP' }
  | { type: 'SLIP' }
  | { type: 'STAGE_UP' }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SYNC_STATE'; payload: Partial<GameState> }
  | { type: 'ADD_SLIP_MESSAGE'; payload: SlipMessage }
  | { type: 'REMOVE_SLIP_MESSAGE'; payload: string }

const initialState: GameState = {
  currentStage: 1,
  totalTaps: 0,
  rugMeter: 0,
  highScore: 0,
  lastTapTime: 0,
  tapCount: 0,
  isOffline: false,
  lastSyncTime: Date.now()
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TAP': {
      const now = Date.now()
      const timeSinceLastTap = now - state.lastTapTime
      const tapsPerSecond = timeSinceLastTap < 1000 ? state.tapCount + 1 : 1
      
      const newTotalTaps = state.totalTaps + 1
      const newRugMeter = state.rugMeter + 1
      const newHighScore = Math.max(state.highScore, newTotalTaps)
      
      const tapsToNextStage = STAGE_FORMULA(state.currentStage)
      const shouldStageUp = newRugMeter >= tapsToNextStage
      
      return {
        ...state,
        totalTaps: newTotalTaps,
        rugMeter: shouldStageUp ? 0 : newRugMeter,
        currentStage: shouldStageUp ? state.currentStage + 1 : state.currentStage,
        highScore: newHighScore,
        lastTapTime: now,
        tapCount: timeSinceLastTap < 1000 ? state.tapCount + 1 : 1
      }
    }
    case 'SLIP': {
      return {
        ...state,
        rugMeter: Math.max(0, state.rugMeter - Math.floor(state.rugMeter * 0.1))
      }
    }
    case 'STAGE_UP': {
      return {
        ...state,
        rugMeter: 0
      }
    }
    case 'SET_USER':
      return {
        ...state,
        ...(action.payload && {
          currentStage: action.payload.current_stage,
          totalTaps: action.payload.total_taps,
          rugMeter: action.payload.rug_meter,
          highScore: action.payload.high_score
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
    default:
      return state
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [slipMessages, setSlipMessages] = React.useState<SlipMessage[]>([])
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

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      syncGameState()
    }
  }, [isOnline, user])

  const addSlipMessage = useCallback((message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const slipMessage: SlipMessage = {
      id,
      message,
      timestamp: Date.now()
    }
    
    setSlipMessages(prev => [...prev, slipMessage])
    
    // Remove message after 3 seconds
    setTimeout(() => {
      setSlipMessages(prev => prev.filter(msg => msg.id !== id))
    }, 3000)
  }, [])

  const handleTap = useCallback(() => {
    const now = Date.now()
    const timeSinceLastTap = now - gameState.lastTapTime
    
    // Anti-cheat: Check tap rate
    if (timeSinceLastTap < MIN_TAP_INTERVAL) {
      addSlipMessage("Slow down there, speed demon! 🏃‍♂️")
      return
    }
    
    const tapsPerSecond = timeSinceLastTap < 1000 ? gameState.tapCount + 1 : 1
    if (tapsPerSecond > MAX_TAPS_PER_SECOND) {
      addSlipMessage("Slow down there, speed demon! 🏃‍♂️")
      return
    }

    // Check for slip
    if (Math.random() < SLIP_CHANCE) {
      dispatch({ type: 'SLIP' })
      const randomMessage = SLIP_MESSAGES[Math.floor(Math.random() * SLIP_MESSAGES.length)]
      addSlipMessage(randomMessage)
      return
    }

    // Process tap
    const oldStage = gameState.currentStage
    dispatch({ type: 'TAP' })
    
    // Check if stage increased
    if (gameState.currentStage > oldStage) {
      dispatch({ type: 'STAGE_UP' })
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
  }, [gameState, user, isOnline, addSlipMessage])

  const syncGameState = useCallback(async () => {
    if (!user || !isOnline) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          current_stage: gameState.currentStage,
          total_taps: gameState.totalTaps,
          rug_meter: gameState.rugMeter,
          high_score: gameState.highScore,
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

  const contextValue: GameContextType = {
    gameState,
    user,
    slipMessages,
    isOnline,
    handleTap,
    syncGameState,
    setUser
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
