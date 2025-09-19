'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-600">
          <div className="bg-black/30 backdrop-blur-sm border-2 border-red-400 rounded-lg p-8 w-full max-w-md text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h1 className="text-3xl font-bold text-red-400 font-press-start mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-yellow-300 font-press-start text-sm mb-6">
              The ape got confused and crashed the game. Don't worry, your progress is safe!
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-press-start py-3 rounded-lg transition-colors"
              >
                Restart Game
              </button>
              
              <button
                onClick={() => {
                  // Clear localStorage and restart
                  localStorage.clear()
                  window.location.reload()
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-press-start py-3 rounded-lg transition-colors"
              >
                Reset Everything
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-yellow-400 font-press-start text-sm cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-black/50 rounded text-red-400 text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
