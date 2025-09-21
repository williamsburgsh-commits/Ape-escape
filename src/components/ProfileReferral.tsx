'use client'

import React, { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import { REFERRAL_REWARDS } from '@/types/game'

export default function ProfileReferral() {
  const { user, applyReferralCode, copyReferralCode } = useGame()
  const [referralCode, setReferralCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const isGangLeader = user.total_referrals >= REFERRAL_REWARDS.GANG_THRESHOLD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode.trim()) return

    setIsLoading(true)
    try {
      const success = await applyReferralCode(referralCode.trim().toUpperCase())
      if (success) {
        setReferralCode('')
      }
    } catch (error) {
      console.error('Referral code error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6">
      <h3 className="text-yellow-400 font-press-start text-lg mb-4">Referral System</h3>
      
      <div className="space-y-6">
        {/* Your Referral Code */}
        <div>
          <h4 className="text-yellow-300 font-press-start text-sm mb-3">Your Referral Code</h4>
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <span className="text-yellow-400 font-press-start text-lg">
              {user.referral_code || 'Generating...'}
            </span>
            <button
              onClick={copyReferralCode}
              disabled={!user.referral_code}
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
                disabled={isLoading || !!user.referred_by}
              />
              <button
                type="submit"
                disabled={!referralCode.trim() || isLoading || !!user.referred_by}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 text-black font-press-start text-sm rounded-lg transition-colors"
              >
                {isLoading ? '...' : 'Use'}
              </button>
            </div>
            {user.referred_by && (
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
                {user.total_referrals}
              </p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-yellow-300/70 font-press-start text-xs mb-1">Gang Progress</p>
              <p className="text-yellow-400 font-press-start text-lg">
                {user.total_referrals}/{REFERRAL_REWARDS.GANG_THRESHOLD}
              </p>
            </div>
          </div>
        </div>

        {/* Gang Leader Status */}
        {isGangLeader && (
          <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg font-press-start text-sm text-center animate-pulse">
            👑 You&apos;re a Gang Leader! You&apos;ve referred {user.total_referrals} apes!
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
  )
}
