'use client'

import React, { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'
import { useAuth } from '@/contexts/AuthContext'
import { REFERRAL_REWARDS } from '@/types/game'
import ShareTracking from './ShareTracking'

export default function ProfileReferral() {
  const { user, applyReferralCode, copyReferralCode } = useGame()
  const { profile, refreshProfile } = useAuth()
  const [referralCode, setReferralCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showGangCreated, setShowGangCreated] = useState(false)

  // Check for gang creation when profile updates
  useEffect(() => {
    if (profile && profile.total_referrals >= REFERRAL_REWARDS.GANG_THRESHOLD) {
      setShowGangCreated(true)
      // Hide the message after 5 seconds
      setTimeout(() => setShowGangCreated(false), 5000)
    }
  }, [profile])

  if (!user || !profile) return null

  const isGangLeader = profile.total_referrals >= REFERRAL_REWARDS.GANG_THRESHOLD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode.trim()) return

    setIsLoading(true)
    try {
      const success = await applyReferralCode(referralCode.trim().toUpperCase())
      if (success) {
        setReferralCode('')
        // Refresh the profile to get updated referral count
        await refreshProfile()
      }
    } catch (error) {
      console.error('Referral code error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6">
        <h3 className="text-yellow-400 font-press-start text-lg mb-4">Referral System</h3>
        
        {/* Gang Created Notification */}
        {showGangCreated && (
          <div className="mb-4 bg-green-600/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg font-press-start text-sm text-center animate-pulse">
            🎉 CONGRATULATIONS! You&apos;ve reached {REFERRAL_REWARDS.GANG_THRESHOLD} referrals and become a Gang Leader! 👑
          </div>
        )}
        
        <div className="space-y-6">
          {/* Your Referral Code */}
          <div>
            <h4 className="text-yellow-300 font-press-start text-sm mb-3">Your Referral Code</h4>
            <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
              <span className="text-yellow-400 font-press-start text-lg">
                {profile.referral_code || 'Generating...'}
              </span>
              <button
                onClick={copyReferralCode}
                disabled={!profile.referral_code}
                className="ml-3 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-press-start text-sm rounded transition-colors disabled:bg-gray-600 disabled:text-gray-400"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Use Referral Code */}
          <div>
            <h4 className="text-yellow-300 font-press-start text-sm mb-3">Use Referral Code</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="APE12345"
                  maxLength={8}
                  className="flex-1 bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-2 text-yellow-300 font-press-start text-sm placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  disabled={isLoading || !!profile.referred_by}
                />
                <button
                  type="submit"
                  disabled={!referralCode.trim() || isLoading || !!profile.referred_by}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 text-black font-press-start text-sm rounded-lg transition-colors"
                >
                  {isLoading ? '...' : 'Use'}
                </button>
              </div>
              {profile.referred_by && (
                <p className="text-green-400 font-press-start text-xs">
                  ✓ You already used a referral code!
                </p>
              )}
            </form>
          </div>

          {/* Referral Stats */}
          <div>
            <h4 className="text-yellow-300 font-press-start text-sm mb-3">Your Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-yellow-300/70 font-press-start text-xs mb-1">Total Referrals</p>
                <p className="text-yellow-400 font-press-start text-lg">
                  {profile.total_referrals}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-yellow-300/70 font-press-start text-xs mb-1">Gang Progress</p>
                <p className="text-yellow-400 font-press-start text-lg">
                  {profile.total_referrals}/{REFERRAL_REWARDS.GANG_THRESHOLD}
                </p>
              </div>
            </div>
          </div>

          {/* Gang Leader Status */}
          {isGangLeader && (
            <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg font-press-start text-sm text-center animate-pulse">
              👑 You&apos;re a Gang Leader! You&apos;ve referred {profile.total_referrals} apes!
              <div className="mt-2 text-xs">
                🎉 Gang auto-created! You now have special privileges!
              </div>
            </div>
          )}

          {/* Gang Progress Bar */}
          {!isGangLeader && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-yellow-300 font-press-start text-sm mb-3">Gang Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-yellow-300/70 font-press-start text-xs">
                  <span>Referrals: {profile.total_referrals}/{REFERRAL_REWARDS.GANG_THRESHOLD}</span>
                  <span>{Math.round((profile.total_referrals / REFERRAL_REWARDS.GANG_THRESHOLD) * 100)}%</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((profile.total_referrals / REFERRAL_REWARDS.GANG_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-yellow-300/60 font-press-start text-xs text-center">
                  {REFERRAL_REWARDS.GANG_THRESHOLD - profile.total_referrals} more referrals to become a Gang Leader!
                </p>
              </div>
            </div>
          )}

          {/* Rewards Info */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-yellow-300 font-press-start text-sm mb-2">Referral Rewards</h4>
            <div className="space-y-1 text-yellow-300/80 font-press-start text-xs">
              <p>• New user gets {REFERRAL_REWARDS.NEW_USER} APE</p>
              <p>• You get {REFERRAL_REWARDS.REFERRER} APE when code used</p>
              <p>• +{REFERRAL_REWARDS.STAGE_10_BONUS} APE when they reach Stage 10!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Tracking */}
      <ShareTracking />
    </div>
  )
}