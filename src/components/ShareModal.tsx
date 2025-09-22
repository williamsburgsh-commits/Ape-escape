'use client'

import React, { useState } from 'react'
import { SHARE_PLATFORMS, SharePlatform } from '@/types/game'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlatform: (platform: SharePlatform) => void
  shareType: 'slip' | 'milestone' | 'manual'
  milestoneStage?: number
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  onSelectPlatform, 
  shareType, 
  milestoneStage 
}: ShareModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null)

  if (!isOpen) return null

  const getShareText = (platform: SharePlatform) => {
    const baseText = shareType === 'slip' 
      ? "Just slipped in APE ESCAPE! 😅 Time for revenge mode! 🦍"
      : shareType === 'milestone'
      ? `Reached Stage ${milestoneStage} in APE ESCAPE! 🎉 The climb continues! 🦍`
      : "Playing APE ESCAPE - the ultimate tap-to-evolve game! 🦍"

    return `${baseText}\n\nPlay now: ape-escape.com`
  }

  const handlePlatformSelect = (platform: SharePlatform) => {
    setSelectedPlatform(platform)
    
    if (platform.id === 'twitter') {
      // Open Twitter with pre-filled tweet
      const tweetText = encodeURIComponent(getShareText(platform))
      const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`
      window.open(twitterUrl, '_blank')
    } else {
      // Copy to clipboard for TikTok/Instagram
      navigator.clipboard.writeText(getShareText(platform))
    }
    
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">🦍</span>
          <h2 className="text-2xl font-bold text-yellow-400 font-press-start mb-2">
            {getTitle()}
          </h2>
          <p className="text-yellow-300 font-press-start text-sm">
            {getSubtitle()}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {SHARE_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform)}
              className={`w-full p-4 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 transition-colors ${platform.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div className="text-left">
                    <div className="font-press-start font-bold">
                      {platform.name}
                    </div>
                    <div className="text-xs opacity-90">
                      {platform.multiplier}x = {platform.baseReward * platform.multiplier} APE
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-90">
                    {platform.id === 'twitter' ? 'Auto-open' : 'Copy text'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-yellow-300 font-press-start text-xs mb-4">
          <p>Max 3 shares per day • 8hr cooldown per platform</p>
          <p>You'll need to verify your post to get APE rewards!</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-press-start py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
