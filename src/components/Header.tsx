'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGame } from '@/contexts/GameContext'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const { gameState, isOnline, triggerShare } = useGame()

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b-2 border-yellow-400 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-4xl">🦍</span>
          <h1 className="text-2xl font-bold text-yellow-400 font-press-start">
            APE ESCAPE
          </h1>
        </div>

        {/* APE Balance */}
        <div className="text-center">
          <div className="text-yellow-400 font-press-start text-lg flex items-center space-x-2">
            <span className="text-2xl">🪙</span>
            <span>APE: {gameState.apeBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          {isOnline ? (
            <div className="text-green-400 text-sm font-press-start">
              ● Online
            </div>
          ) : (
            <div className="text-red-400 text-sm font-press-start">
              🔄 Reconnecting...
            </div>
          )}
          
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 font-press-start text-sm">
                {profile?.username || user.email}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-press-start text-sm transition-colors"
              >
                Exit
              </button>
            </div>
          )}

          <button
            onClick={() => triggerShare('manual', gameState.currentStage)}
            className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded font-press-start text-sm transition-colors"
          >
            📱 Share
          </button>

          <button
            onClick={() => {
              // TODO: Implement bug report functionality
              window.open('mailto:support@apeescape.com?subject=Bug Report', '_blank')
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded font-press-start text-sm transition-colors"
          >
            Report Bug
          </button>
        </div>
      </div>

    </header>
  )
}
