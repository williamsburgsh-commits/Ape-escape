'use client'

import React, { useState } from 'react'
import { useGame } from '@/contexts/GameContext'

interface ReferralInputProps {
  onReferralUsed?: (success: boolean) => void
}

export default function ReferralInput({ onReferralUsed }: ReferralInputProps) {
  const { useReferralCode } = useGame()
  const [referralCode, setReferralCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode.trim()) return

    setIsLoading(true)
    try {
      const success = await useReferralCode(referralCode.trim().toUpperCase())
      if (success) {
        setReferralCode('')
      }
      onReferralUsed?.(success)
    } catch (error) {
      console.error('Referral code error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="referral-code" className="block text-yellow-400 font-press-start text-sm mb-2">
            Have a referral code?
          </label>
          <div className="flex space-x-2">
            <input
              id="referral-code"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="APE12345"
              maxLength={8}
              className="flex-1 bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-2 text-yellow-300 font-press-start text-sm placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!referralCode.trim() || isLoading}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 text-black font-press-start text-sm rounded-lg transition-colors"
            >
              {isLoading ? '...' : 'Use'}
            </button>
          </div>
        </div>
        <p className="text-yellow-300/70 font-press-start text-xs">
          Get 15 APE instantly when you use a referral code! 🎉
        </p>
      </form>
    </div>
  )
}
