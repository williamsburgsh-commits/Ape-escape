'use client'

import React, { useState } from 'react'
import { SharePlatform } from '@/types/game'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (url: string) => Promise<void>
  platform: SharePlatform | null
  isLoading: boolean
  error: string | null
}

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  platform, 
  isLoading,
  error 
}: VerificationModalProps) {
  const [url, setUrl] = useState('')

  if (!isOpen || !platform) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      await onVerify(url.trim())
    }
  }

  const getPlatformDomain = () => {
    switch (platform.id) {
      case 'twitter':
        return 'twitter.com or x.com'
      case 'tiktok':
        return 'tiktok.com'
      case 'instagram':
        return 'instagram.com'
      default:
        return 'social media platform'
    }
  }

  const getPlatformIcon = () => {
    return platform.icon
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">{getPlatformIcon()}</span>
          <h2 className="text-2xl font-bold text-yellow-400 font-press-start mb-2">
            VERIFY YOUR SHARE
          </h2>
          <p className="text-yellow-300 font-press-start text-sm">
            Paste your {platform.name} post URL to get {platform.baseReward * platform.multiplier} APE!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-yellow-400 font-press-start text-sm mb-2">
              Post URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`https://${getPlatformDomain()}/...`}
              required
              className="w-full px-4 py-3 bg-black/50 border border-yellow-400 rounded-lg text-white font-press-start focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="text-yellow-300 font-press-start text-xs mt-1">
              Must be from {getPlatformDomain()}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg font-press-start text-sm bg-red-600 text-white">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-press-start py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify & Get APE'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-yellow-300 font-press-start text-xs">
          <p>⚠️ Anti-abuse: Each URL can only be used once</p>
          <p>⏰ 8-hour cooldown per platform</p>
        </div>
      </div>
    </div>
  )
}
