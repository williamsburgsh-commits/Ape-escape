'use client'

import React from 'react'
import { SharePlatform } from '@/types/game'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlatform: (platform: SharePlatform) => void
  shareType: 'slip' | 'milestone' | 'manual'
  milestoneStage?: number
  shareMessage?: string
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  onSelectPlatform, 
  shareType,
  shareMessage
}: ShareModalProps) {
  if (!isOpen) return null

  const handlePlatformSelect = (platform: SharePlatform) => {
    onSelectPlatform(platform)
  }

  const getTitle = () => {
    switch (shareType) {
      case 'slip':
        return 'Share for Revenge Mode!'
      case 'milestone':
        return 'Share Achievement!'
      default:
        return 'Share APE ESCAPE!'
    }
  }

  const getSubtitle = () => {
    switch (shareType) {
      case 'slip':
        return 'Get APE rewards and unlock Revenge Mode!'
      case 'milestone':
        return 'Celebrate your progress and earn APE!'
      default:
        return 'Earn APE by sharing on social media!'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-gradient-to-br from-purple-600 to-indigo-500 border-2 border-yellow-400 rounded-lg shadow-2xl w-96 h-80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white font-press-start text-xs rounded-full flex items-center justify-center z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center p-4 pt-6">
          <span className="text-2xl mb-1 block">🦍</span>
          <h2 className="text-lg font-bold text-yellow-400 font-press-start mb-1" style={{ textShadow: '2px 2px 0px #000' }}>
            {getTitle()}
          </h2>
          <p className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            {getSubtitle()}
          </p>
        </div>

        {/* Warning Message */}
        <div className="px-4 mb-3">
          <div className="bg-red-600/80 rounded-lg p-3 border border-red-400">
            <div className="text-yellow-300 font-press-start text-xs font-bold text-center" style={{ textShadow: '1px 1px 0px #000' }}>
              ⚠️ All shares are manually verified. Fake shares result in account suspension.
            </div>
          </div>
        </div>

        {/* Share Message */}
        {shareMessage && (
          <div className="px-4 mb-3">
            <div className="bg-black/30 rounded-lg p-3 max-h-24 overflow-y-auto border border-yellow-400/50">
              <div className="text-yellow-300 font-press-start text-xs mb-2 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                📝 Your Share Message:
              </div>
              <div className="text-white font-press-start text-xs break-words leading-relaxed" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {shareMessage}
              </div>
            </div>
          </div>
        )}

        {/* Platform Selection */}
        <div className="px-4 mb-2">
          <div className="text-yellow-300 font-press-start text-xs font-bold mb-2" style={{ textShadow: '1px 1px 0px #000' }}>
            🚀 Choose Your Platform:
          </div>
        </div>

        {/* Platform buttons */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          {/* TikTok Button */}
          <button
            onClick={() => handlePlatformSelect({ id: 'tiktok', name: 'TikTok', multiplier: 3, baseReward: 15, icon: '🎵', color: 'bg-black text-white' })}
            className="w-full p-3 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 bg-black text-white text-xs shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🎵</span>
                <div className="text-left">
                  <div className="font-press-start font-bold text-sm" style={{ textShadow: '1px 1px 0px #000' }}>
                    TikTok
                  </div>
                  <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                    3x Multiplier = 45 APE
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                  Copy text
                </div>
              </div>
            </div>
          </button>

          {/* Twitter Button */}
          <button
            onClick={() => handlePlatformSelect({ id: 'twitter', name: 'Twitter', multiplier: 2, baseReward: 15, icon: '🐦', color: 'bg-blue-500 text-white' })}
            className="w-full p-3 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 bg-blue-500 text-white text-xs shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🐦</span>
                <div className="text-left">
                  <div className="font-press-start font-bold text-sm" style={{ textShadow: '1px 1px 0px #000' }}>
                    Twitter
                  </div>
                  <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                    2x Multiplier = 30 APE
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                  Auto-open
                </div>
              </div>
            </div>
          </button>

          {/* Instagram Button */}
          <button
            onClick={() => handlePlatformSelect({ id: 'instagram', name: 'Instagram', multiplier: 1.5, baseReward: 15, icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' })}
            className="w-full p-3 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📷</span>
                <div className="text-left">
                  <div className="font-press-start font-bold text-sm" style={{ textShadow: '1px 1px 0px #000' }}>
                    Instagram
                  </div>
                  <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                    1.5x Multiplier = 22 APE
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                  Copy text
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3 text-center bg-black/20 rounded-b-lg">
          <div className="text-yellow-300 font-press-start text-xs mb-1" style={{ textShadow: '1px 1px 0px #000' }}>
            Max 3 shares per day • 8hr cooldown per platform
          </div>
          <div className="text-yellow-400 font-press-start text-xs font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
            🎯 Verify your post URL to get APE rewards!
          </div>
        </div>
      </div>
    </div>
  )
}
