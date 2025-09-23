'use client'

import React from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { GameProvider, useGame } from '@/contexts/GameContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoginForm from '@/components/LoginForm'
import UsernameSelection from '@/components/UsernameSelection'
import Header from '@/components/Header'
import LeftSidebar from '@/components/LeftSidebar'
import RightSidebar from '@/components/RightSidebar'
import GameArea from '@/components/GameArea'
import ProfileReferral from '@/components/ProfileReferral'
import ShareModal from '@/components/ShareModal'
import VerificationModal from '@/components/VerificationModal'
import { SharePlatform } from '@/types/game'

function GameApp() {
  const { user, profile, loading } = useAuth()
  const { setUser, shareTrigger, clearShareTrigger, shareToPlatform, verifyShare, getShareMessage, activateRevengeMode } = useGame()
  const [activeTab, setActiveTab] = React.useState('dashboard')
  const [loadingTimeout, setLoadingTimeout] = React.useState(false)
  const [showShareModal, setShowShareModal] = React.useState(false)
  const [showVerificationModal, setShowVerificationModal] = React.useState(false)
  const [selectedPlatform, setSelectedPlatform] = React.useState<SharePlatform | null>(null)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verificationError, setVerificationError] = React.useState<string | null>(null)

  // Set user profile in game context when it changes
  React.useEffect(() => {
    if (profile) {
      setUser(profile)
    }
  }, [profile, setUser])

  // Listen for share triggers from GameContext
  React.useEffect(() => {
    if (shareTrigger) {
      setShowShareModal(true)
    }
  }, [shareTrigger])


  // Timeout for loading state
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true)
      }, 15000) // 15 second timeout

      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
    }
  }, [loading])

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-600">
        <div className="text-center">
          <span className="text-6xl mb-4 block animate-bounce">🦍</span>
          <div className="text-yellow-400 font-press-start text-lg">
            Loading APE ESCAPE...
          </div>
        </div>
      </div>
    )
  }

  if (loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-600">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🦍</span>
          <div className="text-yellow-400 font-press-start text-lg mb-4">
            Loading taking too long...
          </div>
          <div className="text-yellow-300 font-press-start text-sm mb-4">
            Please refresh the page or check your connection
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-press-start px-4 py-2 rounded transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!profile?.username) {
    return <UsernameSelection />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <GameArea />
      case 'profile':
        return (
          <div className="flex-1 flex flex-col items-center justify-start pt-16 p-8">
            <div className="w-full max-w-4xl">
              <h1 className="text-yellow-400 font-press-start text-4xl mb-8 text-center">
                Profile
              </h1>
              <ProfileReferral />
            </div>
          </div>
        )
      case 'gang':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-yellow-400 font-press-start text-4xl mb-4">Gang</h1>
              <p className="text-yellow-300 font-press-start text-lg">Coming Soon!</p>
            </div>
          </div>
        )
      case 'leaderboard':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-yellow-400 font-press-start text-4xl mb-4">Leaderboard</h1>
              <p className="text-yellow-300 font-press-start text-lg">Coming Soon!</p>
            </div>
          </div>
        )
      case 'tournaments':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-yellow-400 font-press-start text-4xl mb-4">Tournaments</h1>
              <p className="text-yellow-300 font-press-start text-lg">Coming Soon!</p>
            </div>
          </div>
        )
      case 'premium':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-yellow-400 font-press-start text-4xl mb-4">Premium</h1>
              <p className="text-yellow-300 font-press-start text-lg">Coming Soon!</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-yellow-400 font-press-start text-4xl mb-4">Settings</h1>
              <p className="text-yellow-300 font-press-start text-lg">Coming Soon!</p>
            </div>
          </div>
        )
      default:
        return <GameArea />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar activeItem={activeTab} onItemClick={setActiveTab} />
        {renderContent()}
        <RightSidebar />
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          clearShareTrigger()
        }}
        onSelectPlatform={(platform) => {
          setSelectedPlatform(platform)
          setShowShareModal(false)
          setShowVerificationModal(true)
          // Use the shareToPlatform function with the current share trigger
          if (shareTrigger) {
            shareToPlatform(platform, shareTrigger.type, shareTrigger.milestoneStage)
          }
        }}
        shareType={shareTrigger?.type || 'manual'}
        milestoneStage={shareTrigger?.milestoneStage}
        shareMessage={shareTrigger ? getShareMessage(shareTrigger.type, shareTrigger.milestoneStage) : undefined}
      />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false)
          setSelectedPlatform(null)
          setVerificationError(null)
        }}
        onVerify={async (url, platform) => {
          setIsVerifying(true)
          setVerificationError(null)
          try {
            await verifyShare(url, platform)
            setShowVerificationModal(false)
            setSelectedPlatform(null)
            
            // Activate revenge mode if this was a slip share
            if (shareTrigger?.type === 'slip') {
              activateRevengeMode()
            }
          } catch (error) {
            setVerificationError(error instanceof Error ? error.message : 'Verification failed')
          } finally {
            setIsVerifying(false)
          }
        }}
        platform={selectedPlatform}
        isLoading={isVerifying}
        error={verificationError}
        shareMessage={shareTrigger ? getShareMessage(shareTrigger.type, shareTrigger.milestoneStage) : undefined}
      />
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <GameApp />
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}