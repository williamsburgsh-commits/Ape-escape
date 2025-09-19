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

function GameApp() {
  const { user, profile, loading } = useAuth()
  const { setUser } = useGame()

  // Set user profile in game context when it changes
  React.useEffect(() => {
    if (profile) {
      setUser(profile)
    }
  }, [profile, setUser])

  if (loading) {
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

  if (!user) {
    return <LoginForm />
  }

  if (!profile?.username) {
    return <UsernameSelection />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <GameArea />
        <RightSidebar />
      </div>
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