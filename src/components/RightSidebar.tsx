'use client'

import React from 'react'
import { useGame } from '@/contexts/GameContext'
import { STAGE_FORMULA } from '@/types/game'

export default function RightSidebar() {
  const { gameState } = useGame()
  
  const tapsToNextStage = STAGE_FORMULA(gameState.currentStage)
  const progressPercentage = (gameState.rugMeter / tapsToNextStage) * 100

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
      value: gameState.rugMeter,
      icon: '🦍'
    },
    {
      label: 'High Score',
      value: gameState.highScore.toLocaleString(),
      icon: '🏆'
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

        {/* Progress Bar */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
          <div className="text-yellow-400 font-press-start text-sm mb-2">
            Progress to Next Stage
          </div>
          <div className="w-full bg-black/50 rounded-full h-4 mb-2">
            <div
              className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-yellow-300 font-press-start text-xs text-center">
            {gameState.rugMeter} / {tapsToNextStage}
          </div>
        </div>

        {/* Next Stage Preview */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
          <div className="text-yellow-400 font-press-start text-sm mb-2">
            Next Stage
          </div>
          <div className="text-yellow-300 font-press-start text-lg">
            Stage {gameState.currentStage + 1}
          </div>
          <div className="text-yellow-300 font-press-start text-xs">
            Requires {STAGE_FORMULA(gameState.currentStage + 1)} total taps
          </div>
        </div>
      </div>
    </aside>
  )
}
