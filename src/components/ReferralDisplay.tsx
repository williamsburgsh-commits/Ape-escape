'use client'

import React, { useState } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function ReferralDisplay() {
  const { user, copyReferralCode } = useGame()
  const [copied, setCopied] = useState(false)

  if (!user?.referral_code) {
    return (
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
        <div className="text-yellow-400 font-press-start text-sm mb-2">
          Referral Code
        </div>
        <div className="text-yellow-300/70 font-press-start text-xs">
          Generating referral code...
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    copyReferralCode()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
      <div className="text-yellow-400 font-press-start text-sm mb-3">
        Your Referral Code
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="bg-black/50 border border-yellow-400/30 rounded-lg px-3 py-2 flex-1">
          <span className="text-yellow-300 font-press-start text-lg">
            {user.referral_code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-2 rounded-lg font-press-start text-xs transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-yellow-400 hover:bg-yellow-500 text-black'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="space-y-2 text-yellow-300/70 font-press-start text-xs">
        <div className="flex justify-between">
          <span>Total Referrals:</span>
          <span className="text-yellow-400">{user.total_referrals || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Gang Progress:</span>
          <span className="text-yellow-400">
            {user.total_referrals || 0}/10
          </span>
        </div>
        {user.total_referrals >= 10 && (
          <div className="text-green-400 font-press-start text-xs text-center mt-2">
            🎉 GANG LEADER! You've referred 10+ players! 🎉
          </div>
        )}
      </div>

      <div className="mt-3 p-2 bg-black/30 rounded text-yellow-300/70 font-press-start text-xs">
        <div className="font-bold text-yellow-400 mb-1">Referral Rewards:</div>
        <div>• New user gets 15 APE</div>
        <div>• You get 20 APE when code used</div>
        <div>• +30 APE when they reach Stage 10!</div>
      </div>
    </div>
  )
}
