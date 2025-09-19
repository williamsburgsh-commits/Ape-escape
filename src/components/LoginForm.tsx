'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        setMessage(error.message)
      } else if (isSignUp) {
        setMessage('Check your email for verification link!')
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
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
            APE ESCAPE
          </h1>
          <p className="text-yellow-300 font-press-start text-sm">
            {isSignUp ? 'Create your account' : 'Welcome back, ape!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-yellow-400 font-press-start text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/50 border border-yellow-400 rounded-lg text-white font-press-start focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-yellow-400 font-press-start text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/50 border border-yellow-400 rounded-lg text-white font-press-start focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg font-press-start text-sm ${
              message.includes('error') || message.includes('Error')
                ? 'bg-red-600 text-white'
                : 'bg-green-600 text-white'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-press-start py-3 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-yellow-400 hover:text-yellow-300 font-press-start text-sm transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>
    </div>
  )
}
