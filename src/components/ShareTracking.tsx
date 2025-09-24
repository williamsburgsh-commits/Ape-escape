'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'

interface ShareStats {
  dailyShares: number
  cooldowns: Record<string, boolean>
  totalShares: number
  totalApeEarned: number
}

export default function ShareTracking() {
  const { getShareStats } = useGame()
  const [shareStats, setShareStats] = useState<ShareStats>({ 
    dailyShares: 0, 
    cooldowns: {}, 
    totalShares: 0, 
    totalApeEarned: 0 
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadShareStats = async () => {
      try {
        const stats = await getShareStats()
        setShareStats(stats)
      } catch (error) {
        console.error('Failed to load share stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadShareStats()
  }, [getShareStats])

  const getCooldownTime = (_platform: string): string => {
    // This would need to be implemented with actual cooldown timestamps
    // For now, we'll show a placeholder
    return 'Available now'
  }

  const getNextResetTime = (): string => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const diffMs = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
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
      <h3 className="text-yellow-400 font-press-start text-lg mb-4">Social Sharing</h3>
      
      <div className="space-y-4">
        {/* Daily Usage */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Daily Usage</h4>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300/70 font-press-start text-sm">Shares Used Today</span>
              <span className={`font-press-start text-lg ${shareStats.dailyShares >= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                {shareStats.dailyShares}/3
              </span>
            </div>
            {shareStats.dailyShares >= 3 && (
              <div className="text-red-400 font-press-start text-xs mt-1">
                Daily limit reached! Resets in {getNextResetTime()}
              </div>
            )}
          </div>
        </div>

        {/* Platform Cooldowns */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Platform Cooldowns</h4>
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

        {/* Next Reset */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-2">Reset Timer</h4>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300/70 font-press-start text-sm">Next Reset</span>
              <span className="text-yellow-400 font-press-start text-sm">
                {getNextResetTime()}
              </span>
            </div>
            <div className="text-yellow-300/60 font-press-start text-xs mt-1">
              Daily shares reset at midnight
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
            <p>• Max 3 shares per day • 8hr cooldown per platform</p>
          </div>
        </div>
      </div>
    </div>
  )
}
