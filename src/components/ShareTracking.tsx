'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useGame } from '@/contexts/GameContext'

interface ShareStats {
  dailyShares: number
  cooldowns: Record<string, boolean>
  cooldownTimes: Record<string, number>
  totalShares: number
  totalApeEarned: number
}

export default function ShareTracking() {
  const { getShareStats } = useGame()
  const [shareStats, setShareStats] = useState<ShareStats>({ 
    dailyShares: 0, 
    cooldowns: {}, 
    cooldownTimes: {},
    totalShares: 0, 
    totalApeEarned: 0 
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadShareStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const stats = await getShareStats()
      setShareStats(stats)
    } catch (error) {
      console.warn('⚠️ Failed to load share stats:', error)
      // Set default stats on error
      setShareStats({ 
        dailyShares: 0, 
        cooldowns: {}, 
        cooldownTimes: {},
        totalShares: 0, 
        totalApeEarned: 0 
      })
    } finally {
      setIsLoading(false)
    }
  }, [getShareStats])

  useEffect(() => {
    loadShareStats()
  }, [getShareStats, loadShareStats])

  const getCooldownTime = (platform: string): string => {
    const cooldownSeconds = shareStats.cooldownTimes[platform]
    if (!cooldownSeconds || cooldownSeconds <= 0) {
      return 'Available now'
    }
    
    const hours = Math.floor(cooldownSeconds / 3600)
    const minutes = Math.floor((cooldownSeconds % 3600) / 60)
    const seconds = Math.floor(cooldownSeconds % 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }


  if (isLoading) {
    return (
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6">
        <h3 className="text-yellow-400 font-press-start text-lg mb-4">Social Sharing</h3>
        <div className="text-yellow-300 font-press-start text-sm">Loading share stats...</div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-400 font-press-start text-lg">Social Sharing</h3>
        <button
          onClick={loadShareStats}
          disabled={isLoading}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start text-xs px-3 py-1 rounded transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Daily Usage */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Daily Usage</h4>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300/70 font-press-start text-sm">Shares Used (24h)</span>
              <span className={`font-press-start text-lg ${shareStats.dailyShares >= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                {shareStats.dailyShares}/3
              </span>
            </div>
            {shareStats.dailyShares >= 3 && (
              <div className="text-red-400 font-press-start text-xs mt-1">
                Daily limit reached! Uses 24-hour rolling window
              </div>
            )}
          </div>
        </div>

        {/* Platform Cooldowns */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Platform Cooldowns (8h)</h4>
          <div className="space-y-2">
            {['twitter', 'tiktok', 'instagram'].map((platform) => (
              <div key={platform} className="bg-black/20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-300/70 font-press-start text-sm capitalize">
                    {platform === 'twitter' ? 'X/Twitter' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                  <span className={`font-press-start text-sm ${shareStats.cooldowns[platform] ? 'text-red-400' : 'text-green-400'}`}>
                    {shareStats.cooldowns[platform] ? 'Cooldown active' : 'Available'}
                  </span>
                </div>
                {shareStats.cooldowns[platform] && (
                  <div className="text-red-400 font-press-start text-xs mt-1">
                    Available in {getCooldownTime(platform)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reset Info */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Reset Info</h4>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300/70 font-press-start text-sm">Reset Type</span>
              <span className="text-yellow-400 font-press-start text-sm">
                Rolling 24h window
              </span>
            </div>
            <div className="text-yellow-300/60 font-press-start text-xs mt-1">
              Daily shares reset 24 hours after first share
            </div>
          </div>
        </div>

        {/* Share Statistics */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-yellow-300/70 font-press-start text-xs mb-1">Total Shares</p>
              <p className="text-yellow-400 font-press-start text-lg">
                {shareStats.totalShares}
              </p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-yellow-300/70 font-press-start text-xs mb-1">APE from Shares</p>
              <p className="text-yellow-400 font-press-start text-lg">
                {shareStats.totalApeEarned}
              </p>
            </div>
          </div>
        </div>

        {/* Share Rewards Info */}
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Share Rewards</h4>
          <div className="space-y-1 text-yellow-300/80 font-press-start text-xs">
            <p>• TikTok: 45 APE (3x multiplier)</p>
            <p>• X/Twitter: 30 APE (2x multiplier)</p>
            <p>• Instagram: 22 APE (1.5x multiplier)</p>
            <p>• Max 3 shares per 24h • 8hr cooldown per platform</p>
            <p>• Example: Twitter (2PM) → Instagram (3PM) → TikTok (4PM) → Done</p>
          </div>
        </div>
      </div>
    </div>
  )
}
