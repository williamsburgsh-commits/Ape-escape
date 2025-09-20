'use client'

import React, { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import { STAGE_FORMULA, RUG_METER_ZONES } from '@/types/game'

export default function GameArea() {
  const { gameState, handleTap, slipMessages } = useGame()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showStageUp, setShowStageUp] = useState(false)

  const tapsToNextStage = STAGE_FORMULA(gameState.currentStage)
  const progressPercentage = (gameState.rugMeter / tapsToNextStage) * 100

  // Get Rug Meter color based on slip chance percentage
  const getRugMeterColorBySlipChance = (slipChance: number) => {
    const slipPercentage = slipChance * 100
    if (slipPercentage <= 1.0) return 'bg-green-500'
    if (slipPercentage <= 3.0) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleApeClick = () => {
    setIsAnimating(true)
    handleTap()
    
    // Check if stage increased
    const newTapsToNextStage = STAGE_FORMULA(gameState.currentStage)
    if (gameState.rugMeter >= newTapsToNextStage) {
      setShowStageUp(true)
      setTimeout(() => setShowStageUp(false), 2000)
    }
    
    setTimeout(() => setIsAnimating(false), 150)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
      {/* Stage Up Animation */}
      {showStageUp && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-yellow-400 text-black font-press-start text-2xl px-6 py-3 rounded-lg animate-bounce">
            STAGE UP! 🎉
          </div>
        </div>
      )}

      {/* Main Game Area - Centered with compact hierarchy */}
      <div className="text-center space-y-6">
        {/* 1. Stage Display - Prominent but not overwhelming */}
        <div>
          <h1 className="text-yellow-400 font-press-start text-4xl mb-2">
            Stage {gameState.currentStage}
          </h1>
          <div className="text-yellow-300 font-press-start text-lg">
            {tapsToNextStage - gameState.rugMeter} taps to next stage
          </div>
        </div>

        {/* 2. Large Clickable Ape - Main focal point */}
        <div>
          <button
            onClick={handleApeClick}
            disabled={isAnimating}
            className={`text-9xl transition-all duration-150 select-none ${
              isAnimating
                ? 'scale-110 transform rotate-12'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            🦍
          </button>
        </div>

        {/* 3. Stage Progress Bar - Clean horizontal bar */}
        <div className="w-96 mx-auto">
          <div className="text-yellow-400 font-press-start text-sm mb-2">
            Stage Progress: {gameState.rugMeter} / {tapsToNextStage}
          </div>
          <div className="w-full bg-black/50 rounded-full h-6">
            <div
              className="bg-yellow-400 h-6 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 4. Rug Meter Display - Dynamic color based on slip chance */}
        <div className="w-96 mx-auto">
          <div className="text-yellow-400 font-press-start text-sm mb-2">
            Rug Meter: {(gameState.slipChance * 100).toFixed(1)}% Slip Chance
          </div>
          <div className="w-full bg-black/50 rounded-full h-6">
            <div
              className={`${getRugMeterColorBySlipChance(gameState.slipChance)} h-6 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(gameState.rugMeterProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slip Messages */}
      <div className="absolute bottom-4 right-4 space-y-2">
        {slipMessages.map((message) => (
          <div
            key={message.id}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-press-start text-sm animate-pulse"
          >
            {message.message}
          </div>
        ))}
      </div>

      {/* Offline Indicator */}
      {!gameState.isOffline && (
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded font-press-start text-sm">
          ● Online
        </div>
      )}
    </div>
  )
}
