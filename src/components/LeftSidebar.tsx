'use client'

import React from 'react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'gang', label: 'Gang', icon: '🦍' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'tournaments', label: 'Tournaments', icon: '⚔️' },
  { id: 'premium', label: 'Premium', icon: '💎' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

interface LeftSidebarProps {
  activeItem: string
  onItemClick: (itemId: string) => void
}

export default function LeftSidebar({ activeItem, onItemClick }: LeftSidebarProps) {

  return (
    <aside className="w-64 bg-black/30 backdrop-blur-sm border-r-2 border-yellow-400 p-6">
      <nav className="space-y-2">
        <h2 className="text-yellow-400 font-press-start text-lg mb-6">
          Navigation
        </h2>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-press-start text-sm ${
              activeItem === item.id
                ? 'bg-yellow-400 text-black'
                : 'text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Coming Soon Notice */}
      <div className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
        <p className="text-yellow-400 font-press-start text-xs text-center">
          More features coming soon!
        </p>
      </div>
    </aside>
  )
}
