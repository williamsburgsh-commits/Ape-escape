'use client'

import React, { useState, useEffect } from 'react'

export interface SharePlatform {
  id: 'tiktok' | 'twitter' | 'instagram'
  name: string
  multiplier: number
  baseReward: number
  icon: string
  color: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (url: string, platform: string) => Promise<void>
  shareToPlatform: (platform: SharePlatform, shareType: 'slip' | 'milestone' | 'manual', milestoneStage?: number) => void
  shareType: 'slip' | 'milestone' | 'manual'
  milestoneStage?: number
  shareMessage: string
  isLoading?: boolean
  error?: string | null
}

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    multiplier: 3,
    baseReward: 15,
    icon: '🎵',
    color: 'bg-black text-white'
  },
  {
    id: 'twitter',
    name: 'X/Twitter',
    multiplier: 2,
    baseReward: 15,
    icon: '𝕏',
    color: 'bg-blue-500 text-white'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    multiplier: 1.5,
    baseReward: 15,
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
  }
]

export default function ShareModal({
  isOpen,
  onClose,
  onVerify,
  shareToPlatform: _shareToPlatform,
  shareType,
  milestoneStage: _milestoneStage,
  shareMessage,
  isLoading = false,
  error = null
}: ShareModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null)
  const [url, setUrl] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform(null)
      setUrl('')
      setIsSuccess(false)
    }
  }, [isOpen])

  const handlePlatformSelect = (platform: SharePlatform) => {
    setSelectedPlatform(platform)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim() && selectedPlatform) {
      try {
        console.log('🔄 Starting share verification...')
        await onVerify(url.trim(), selectedPlatform.id)
        console.log('✅ Verification completed successfully')
        setIsSuccess(true)
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
        
      } catch (error) {
        console.error('❌ Verification failed:', error)
        // Error is handled by parent component
      }
    }
  }

  const handleClose = () => {
    setSelectedPlatform(null)
    setUrl('')
    setIsSuccess(false)
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

  if (!isOpen) return null

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
        <div className="text-center p-4 pt-6">
          <span className="text-2xl mb-2 block">🏆</span>
          <h2 className="text-xl font-bold text-yellow-400 font-press-start mb-2" style={{ textShadow: '2px 2px 0px #000' }}>
            {getTitle()}
          </h2>
          <p className="text-yellow-300 font-press-start text-sm" style={{ textShadow: '1px 1px 0px #000' }}>
            Earn APE by sharing on social media!
          </p>
        </div>

        {/* Warning Message */}
        <div className="px-4 mb-3">
          <div className="bg-red-600/80 rounded-lg p-3 border border-red-400">
            <div className="text-yellow-300 font-press-start text-sm font-bold text-center" style={{ textShadow: '1px 1px 0px #000' }}>
              ⚠️ All shares manually verified. Fake shares = account suspension.
            </div>
          </div>
        </div>

        {/* Share Message Preview */}
        <div className="px-4 mb-3">
          <div className="bg-black/30 rounded-lg p-3 max-h-20 overflow-y-auto border border-yellow-400/50">
            <div className="text-yellow-300 font-press-start text-sm mb-1 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
              Your Share Message:
            </div>
            <div className="text-white font-press-start text-sm break-words leading-tight" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {shareMessage}
            </div>
          </div>
        </div>

        {!selectedPlatform ? (
          <>
            {/* Platform Selection */}
            <div className="px-4 mb-3">
              <div className="text-yellow-300 font-press-start text-sm font-bold mb-2" style={{ textShadow: '1px 1px 0px #000' }}>
                Choose Your Platform:
              </div>
            </div>

            {/* Platform buttons */}
            <div className="flex-1 px-4 space-y-2 overflow-y-auto">
              {SHARE_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  className={`w-full p-3 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all duration-200 ${platform.color} text-sm shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{platform.icon}</span>
                      <span className="font-press-start font-bold">{platform.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-press-start font-bold">
                        {platform.baseReward * platform.multiplier} APE
                      </div>
                      <div className="text-xs opacity-80">
                        {platform.multiplier}x multiplier
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* URL Submission Form */}
            <form onSubmit={handleSubmit} className="flex-1 px-4 space-y-3">
              <div>
                <label className="block text-yellow-400 font-press-start text-sm mb-2 font-bold" style={{ textShadow: '1px 1px 0px #000' }}>
                  📎 Paste your post URL here:
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={`https://${selectedPlatform.id === 'twitter' ? 'x.com' : selectedPlatform.id === 'tiktok' ? 'tiktok.com' : 'instagram.com'}/...`}
                  required
                  className="w-full px-3 py-2 bg-black/50 border border-yellow-400 rounded text-white font-press-start text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="text-yellow-300 font-press-start text-xs mt-1" style={{ textShadow: '1px 1px 0px #000' }}>
                  ✅ Must be from {selectedPlatform.name} • 🔒 One-time use
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-600/80 rounded-lg p-3 text-white font-press-start text-sm">
                  <div className="font-bold">❌ Verification Failed:</div>
                  <div className="mt-1">{error}</div>
                </div>
              )}

              {/* Success Message */}
              {isSuccess ? (
                <div className="text-center py-4">
                  <div className="text-green-400 font-press-start text-lg mb-2" style={{ textShadow: '1px 1px 0px #000' }}>
                    ✅ Success! APE Awarded!
                  </div>
                  <div className="text-yellow-300 font-press-start text-sm" style={{ textShadow: '1px 1px 0px #000' }}>
                    Share submitted for review. Closing in 2 seconds...
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-press-start py-2 rounded text-sm transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !url.trim()}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start py-2 rounded text-sm transition-colors font-bold"
                  >
                    {isLoading ? 'Verifying...' : `Verify & Get ${selectedPlatform.baseReward * selectedPlatform.multiplier} APE`}
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {/* Footer info */}
        <div className="p-3 text-center bg-black/20 rounded-b-lg">
          <div className="text-yellow-300 font-press-start text-xs" style={{ textShadow: '1px 1px 0px #000' }}>
            Max 3/day • 8hr cooldown • Verify URL for APE!
          </div>
        </div>
      </div>
    </div>
  )
}
