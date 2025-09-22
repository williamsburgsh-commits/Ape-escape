'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function UsernameSelection() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { updateProfile } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      setLoading(false)
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting to update profile with username:', username.trim())
      const { error } = await updateProfile({ username: username.trim() })
      
      if (error) {
        console.error('Error updating profile:', error)
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          setError('Username is already taken')
        } else if (error.message.includes('No profile found')) {
          setError('Profile not found. Please try refreshing the page.')
        } else {
          setError(`Error: ${error.message}`)
        }
      } else {
        console.log('Profile updated successfully')
        // The profile will be updated in the AuthContext, which will trigger a re-render
        // No need to manually set the user in GameContext here
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-600">
      <div className="bg-black/30 backdrop-blur-sm border-2 border-yellow-400 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">🦍</span>
          <h1 className="text-3xl font-bold text-yellow-400 font-press-start mb-2">
            Choose Your Ape Name
          </h1>
          <p className="text-yellow-300 font-press-start text-sm">
            This will be your display name in the game
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-yellow-400 font-press-start text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={20}
              className="w-full px-4 py-3 bg-black/50 border border-yellow-400 rounded-lg text-white font-press-start focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your ape name"
            />
            <div className="text-yellow-300 font-press-start text-xs mt-1">
              {username.length}/20 characters
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg font-press-start text-sm bg-red-600 text-white">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Start Playing!'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-yellow-300 font-press-start text-xs">
            You can only set your username once, so choose wisely!
          </p>
        </div>
      </div>
    </div>
  )
}
