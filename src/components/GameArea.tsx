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

  // Get Rug Meter color based on progress
  const getRugMeterColor = (progress: number) => {
    if (progress <= RUG_METER_ZONES.SAFE.max) return 'bg-green-500'
    if (progress <= RUG_METER_ZONES.WARNING.max) return 'bg-yellow-500'
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

      {/* Main Game Area */}
      <div className="text-center">
        {/* Current Stage */}
        <div className="mb-8">
          <h2 className="text-yellow-400 font-press-start text-3xl mb-2">
            Stage {gameState.currentStage}
          </h2>
          <div className="text-yellow-300 font-press-start text-lg">
            {tapsToNextStage - gameState.rugMeter} taps to next stage
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="w-96 mb-4">
          <div className="text-yellow-400 font-press-start text-sm mb-2">
            Stage Progress: {gameState.rugMeter} / {tapsToNextStage}
          </div>
          <div className="w-full bg-black/50 rounded-full h-6 mb-2">
            <div
              className="bg-yellow-400 h-6 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Rug Meter */}
        <div className="w-96 mb-8">
          <div className="text-yellow-400 font-press-start text-sm mb-2">
            Rug Meter: {(gameState.slipChance * 100).toFixed(1)}% Slip Chance
          </div>
          <div className="w-full bg-black/50 rounded-full h-6 mb-2">
            <div
              className={`${getRugMeterColor(gameState.rugMeterProgress)} h-6 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(gameState.rugMeterProgress, 100)}%` }}
            />
          </div>
          <div className="text-yellow-300 font-press-start text-xs text-center">
            {Math.floor(gameState.rugMeterProgress)}% Progress
          </div>
        </div>

        {/* Tappable Ape */}
        <div className="mb-8">
          <button
            onClick={handleApeClick}
            disabled={isAnimating}
            className={`text-8xl transition-all duration-150 select-none ${
              isAnimating
                ? 'scale-110 transform rotate-12'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            🦍
          </button>
        </div>

        {/* Tap Instructions */}
        <div className="text-yellow-400 font-press-start text-lg">
          TAP THE APE TO EVOLVE!
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
