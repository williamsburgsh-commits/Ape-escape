'use client'

import React, { useState, useEffect } from 'react'
import { SharePlatform } from '@/types/game'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (url: string, platform: string) => Promise<void>
  shareToPlatform: (platform: SharePlatform, shareType: 'slip' | 'milestone' | 'manual', milestoneStage?: number) => void
  shareType: 'slip' | 'milestone' | 'manual'
  milestoneStage?: number
  shareMessage?: string
  isLoading?: boolean
  error?: string | null
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  onVerify,
  shareToPlatform,
  shareType,
  milestoneStage,
  shareMessage,
  isLoading = false,
  error = null
}: ShareModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null)
  const [url, setUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform(null)
      setUrl('')
      setCopySuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePlatformSelect = (platform: SharePlatform) => {
    setSelectedPlatform(platform)
    // Call the shareToPlatform function to handle the platform-specific sharing
    shareToPlatform(platform, shareType, milestoneStage)
  }

  const handleCopyMessage = async () => {
    if (shareMessage) {
      try {
        await navigator.clipboard.writeText(shareMessage)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim() && selectedPlatform) {
      await onVerify(url.trim(), selectedPlatform.id)
    }
  }

  const handleClose = () => {
    setSelectedPlatform(null)
    setUrl('')
    setCopySuccess(false)
    onClose()
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
        return 'Get APE rewards and unlock Revenge Mode!'
      case 'milestone':
        return 'Celebrate your progress and earn APE!'
      default:
        return 'Earn APE by sharing on social media!'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative bg-gradient-to-br from-purple-600 to-indigo-500 border-2 border-yellow-400 rounded-lg shadow-2xl w-96 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white font-press-start text-xs rounded-full flex items-center justify-center z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center p-3 pt-5">
          <span className="text-xl mb-1 block">🍌</span>
          <h2 className="text-base font-bold text-yellow-400 font-press-start mb-1" style={{ textShadow: '2px 2px 0px #000' }}>
            {getTitle()}
          </h2>
          <p className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            {getSubtitle()}
          </p>
        </div>

        {/* Warning Message */}
        <div className="px-3 mb-2">
          <div className="bg-red-600/80 rounded-lg p-2 border border-red-400">
            <div className="text-yellow-300 font-press-start text-xs font-bold text-center" style={{ textShadow: '1px 1px 0px #000' }}>
              ⚠️ All shares verified. Fake shares = suspension.
            </div>
          </div>
        </div>

        {!selectedPlatform ? (
          // Platform Selection View
          <>
            {/* Share Message */}
            {shareMessage && (
              <div className="px-3 mb-2">
                <div className="bg-black/30 rounded-lg p-2 max-h-16 overflow-y-auto border border-yellow-400/50">
                  <div className="text-yellow-300 font-press-start text-xs mb-1 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                    Generated Share Content:
                  </div>
                  <div className="text-white font-press-start text-xs break-words leading-tight" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {shareMessage}
                  </div>
                </div>
              </div>
            )}

            {/* Platform Selection */}
            <div className="px-3 mb-1">
              <div className="text-yellow-300 font-press-start text-xs font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                Choose Your Platform:
              </div>
            </div>

            {/* Platform buttons */}
            <div className="flex-1 px-3 space-y-1.5 overflow-y-auto">
              {/* TikTok Button */}
              <button
                onClick={() => handlePlatformSelect({ id: 'tiktok', name: 'TikTok', multiplier: 3, baseReward: 15, icon: '🎵', color: 'bg-black text-white' })}
                className="w-full p-2 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 bg-black text-white text-xs shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎵</span>
                    <div className="text-left">
                      <div className="font-press-start font-bold text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
                        Share on TikTok
                      </div>
                      <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                        (+45 APE)
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Twitter Button */}
              <button
                onClick={() => handlePlatformSelect({ id: 'twitter', name: 'Twitter', multiplier: 2, baseReward: 15, icon: '🐦', color: 'bg-blue-500 text-white' })}
                className="w-full p-2 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 bg-blue-500 text-white text-xs shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🐦</span>
                    <div className="text-left">
                      <div className="font-press-start font-bold text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
                        Share on Twitter
                      </div>
                      <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                        (+30 APE)
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Instagram Button */}
              <button
                onClick={() => handlePlatformSelect({ id: 'instagram', name: 'Instagram', multiplier: 1.5, baseReward: 15, icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' })}
                className="w-full p-2 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📷</span>
                    <div className="text-left">
                      <div className="font-press-start font-bold text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
                        Share on Instagram
                      </div>
                      <div className="text-xs opacity-90 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                        (+22 APE)
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          // URL Submission View
          <>
            {/* Share Message for Copy/Open */}
            {shareMessage && (
              <div className="px-3 mb-2">
                <div className="bg-black/30 rounded-lg p-2 border border-yellow-400/50">
                  <div className="text-yellow-300 font-press-start text-xs mb-1 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                    📝 Your Share Message:
                  </div>
                  <div className="text-white font-press-start text-xs break-words leading-tight mb-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {shareMessage}
                  </div>
                  {selectedPlatform.id === 'twitter' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`
                        window.open(twitterUrl, '_blank')
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-press-start py-1.5 rounded text-xs transition-colors font-bold"
                    >
                      🐦 Open Twitter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-press-start py-1.5 rounded text-xs transition-colors font-bold"
                    >
                      {copySuccess ? '✅ Copied!' : '📋 Copy Message'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* URL Submission Form */}
            <form onSubmit={handleSubmit} className="flex-1 px-3 space-y-2">
              <div>
                <label className="block text-yellow-400 font-press-start text-xs mb-1 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                  📎 Post URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={`https://${selectedPlatform.id === 'twitter' ? 'twitter.com' : selectedPlatform.id === 'tiktok' ? 'tiktok.com' : 'instagram.com'}/...`}
                  required
                  className="w-full px-2 py-1.5 bg-black/50 border border-yellow-400 rounded text-white font-press-start text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="text-yellow-300 font-press-start text-xs mt-1" style={{ textShadow: '1px 1px 0px #000' }}>
                  ✅ Must be from {selectedPlatform.name} • 🔒 One-time use
                </div>
              </div>

              {error && (
                <div className="p-2 rounded-lg font-press-start text-xs bg-red-600 text-white border border-red-400">
                  <div className="font-bold">❌ Verification Failed:</div>
                  <div className="mt-1">{error}</div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-press-start py-1.5 rounded text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start py-1.5 rounded text-xs transition-colors font-bold"
                >
                  {isLoading ? 'Verifying...' : `Verify & Get ${selectedPlatform.baseReward * selectedPlatform.multiplier} APE`}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Footer info */}
        <div className="p-2 text-center bg-black/20 rounded-b-lg">
          <div className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            Max 3/day • 8hr cooldown • 🎯 Verify URL for APE!
          </div>
        </div>
      </div>
    </div>
  )
}
