'use client'

import React from 'react'
import { SHARE_PLATFORMS, SharePlatform } from '@/types/game'

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
    // The parent component will handle the actual sharing logic
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
        return 'Get APE rewards for sharing your slip!'
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

        {/* Share Message Preview */}
        {shareMessage && (
          <div className="px-4 mb-3">
            <div className="bg-black/30 rounded-lg p-3 max-h-20 overflow-y-auto">
              <div className="text-yellow-300 font-press-start text-xs mb-1" style={{ textShadow: '1px 1px 0px #000' }}>
                Preview:
              </div>
              <div className="text-white font-press-start text-xs break-words" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {shareMessage}
              </div>
            </div>
          </div>
        )}

        {/* Platform buttons */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          {SHARE_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform)}
              className={`w-full p-2 rounded border-2 border-yellow-400 hover:border-yellow-300 transition-colors ${platform.color} text-xs`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{platform.icon}</span>
                  <div className="text-left">
                    <div className="font-press-start font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                      {platform.name}
                    </div>
                    <div className="text-xs opacity-90" style={{ textShadow: '1px 1px 0px #000' }}>
                      {platform.multiplier}x = {platform.baseReward * platform.multiplier} APE
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-90" style={{ textShadow: '1px 1px 0px #000' }}>
                    {platform.id === 'twitter' ? 'Auto-open' : 'Copy text'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 text-center">
          <div className="text-yellow-300 font-press-start text-xs mb-1" style={{ textShadow: '1px 1px 0px #000' }}>
            Max 3 shares per day • 8hr cooldown
          </div>
          <div className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            Verify your post to get APE rewards!
          </div>
        </div>
      </div>
    </div>
  )
}