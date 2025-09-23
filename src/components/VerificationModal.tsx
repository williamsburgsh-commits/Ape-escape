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
    <div className="fixed bottom-5 right-5 z-50 w-80 h-80">
      <div className="relative bg-gradient-to-br from-purple-600 to-indigo-500 border-2 border-yellow-400 rounded-lg shadow-2xl h-full flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white font-press-start text-xs rounded-full flex items-center justify-center z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center p-4 pt-6">
          <span className="text-2xl mb-1 block">{getPlatformIcon()}</span>
          <h2 className="text-lg font-bold text-yellow-400 font-press-start mb-1" style={{ textShadow: '2px 2px 0px #000' }}>
            VERIFY YOUR SHARE
          </h2>
          <p className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            Paste your {platform.name} post URL to get {platform.baseReward * platform.multiplier} APE!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-4 space-y-3">
          <div>
            <label className="block text-yellow-400 font-press-start text-xs mb-1" style={{ textShadow: '1px 1px 0px #000' }}>
              Post URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`https://${getPlatformDomain()}/...`}
              required
              className="w-full px-3 py-2 bg-black/50 border border-yellow-400 rounded text-white font-press-start text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="text-yellow-300 font-press-start text-xs mt-1" style={{ textShadow: '1px 1px 0px #000' }}>
              Must be from {getPlatformDomain()}
            </div>
          </div>

          {error && (
            <div className="p-2 rounded font-press-start text-xs bg-red-600 text-white">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-press-start py-2 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start py-2 rounded text-xs transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify & Get APE'}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="p-3 text-center">
          <div className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            ⚠️ Anti-abuse: Each URL can only be used once
          </div>
          <div className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            ⏰ 8-hour cooldown per platform
          </div>
        </div>
      </div>
    </div>
  )
}
