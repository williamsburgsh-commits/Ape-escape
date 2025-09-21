'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'
import { STAGE_FORMULA, RUG_METER_ZONES } from '@/types/game'

export default function RightSidebar() {
  const { gameState, resetSessionTime } = useGame()
  const [sessionTime, setSessionTime] = useState(0)
  
  const tapsToNextStage = STAGE_FORMULA(gameState.currentStage)
  const progressPercentage = (gameState.rugMeter / tapsToNextStage) * 100

  // Accurate session timer - only counts active play time
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.isSessionActive) {
        const now = Date.now()
        const timeSinceLastActivity = now - gameState.lastActivityTime
        const totalActiveTime = gameState.sessionActiveTime + timeSinceLastActivity
        setSessionTime(Math.floor(totalActiveTime / 1000))
      } else {
        // Session is paused, use stored active time
        setSessionTime(Math.floor(gameState.sessionActiveTime / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState.isSessionActive, gameState.sessionActiveTime, gameState.lastActivityTime])

  // Format session time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Get Rug Meter color based on progress
  const getRugMeterColor = (progress: number) => {
    if (progress <= RUG_METER_ZONES.SAFE.max) return 'bg-green-500'
    if (progress <= RUG_METER_ZONES.WARNING.max) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const stats = [
    {
      label: 'Total Taps',
      value: gameState.totalTaps.toLocaleString(),
      icon: '👆'
    },
    {
      label: 'Current Stage',
      value: gameState.currentStage,
      icon: '🎯'
    },
    {
      label: 'Rug Count',
      value: gameState.rugCount,
      icon: '🦍'
    },
    {
      label: 'High Score',
      value: gameState.highScore.toLocaleString(),
      icon: '🏆'
    }
  ]

  const sessionStats = [
    {
      label: 'Session Taps',
      value: gameState.sessionTaps.toLocaleString(),
      icon: '⚡'
    },
    {
      label: 'Session Slips',
      value: `${gameState.sessionSlips}/2`,
      icon: '⚠️'
    },
    {
      label: 'Session Time',
      value: formatTime(sessionTime),
      icon: '⏱️'
    }
  ]

  return (
    <aside className="w-64 bg-black/30 backdrop-blur-sm border-l-2 border-yellow-400 p-6">
      <h2 className="text-yellow-400 font-press-start text-lg mb-6">
        Stats
      </h2>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-yellow-400 font-press-start text-lg">
                {stat.value}
              </span>
            </div>
            <div className="text-yellow-300 font-press-start text-sm">
              {stat.label}
            </div>
          </div>
        ))}


        {/* Session Stats */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
          <div className="text-yellow-400 font-press-start text-sm mb-3">
            Session Stats
          </div>
          <div className="space-y-2">
            {sessionStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-yellow-300 font-press-start text-xs">
                    {stat.label}
                  </span>
                </div>
                <span className="text-yellow-400 font-press-start text-sm">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
          
          {/* Reset Session Time Button */}
          <button
            onClick={resetSessionTime}
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-press-start text-xs px-3 py-2 rounded transition-colors"
          >
            Reset Session Time
          </button>
        </div>
      </div>
    </aside>
  )
}
