'use client'

import { useState, useEffect } from 'react'
import { getRecentlyViewed, RecentToken, clearRecentlyViewed } from '@/lib/recentlyViewed'

interface RecentlyViewedBarProps {
  onTokenClick: (address: string) => void
}

export default function RecentlyViewedBar({ onTokenClick }: RecentlyViewedBarProps) {
  const [recentTokens, setRecentTokens] = useState<RecentToken[]>([])

  useEffect(() => {
    // Load initial data
    setRecentTokens(getRecentlyViewed())

    // Listen for changes
    const handleChange = () => {
      setRecentTokens(getRecentlyViewed())
    }

    window.addEventListener('recentlyViewedChanged', handleChange)
    return () => window.removeEventListener('recentlyViewedChanged', handleChange)
  }, [])

  if (recentTokens.length === 0) {
    return null
  }

  return (
    <div className="bg-card/50 border-b border-gray-800/50 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 flex-shrink-0">Recently viewed:</span>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {recentTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => onTokenClick(token.address)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-gray-700/50 rounded-full hover:border-primary/50 hover:bg-primary/10 transition-all flex-shrink-0 group"
              title={`${token.name} (${token.symbol})`}
            >
              {token.image && (
                <img 
                  src={token.image} 
                  alt={token.name} 
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <span className="text-xs text-gray-300 group-hover:text-primary transition-colors max-w-[100px] truncate">
                {token.name}
              </span>
              <span className="text-[10px] text-gray-500 group-hover:text-primary/70 transition-colors">
                ${token.symbol}
              </span>
            </button>
          ))}
        </div>
        {recentTokens.length > 0 && (
          <button
            onClick={() => {
              clearRecentlyViewed()
              setRecentTokens([])
            }}
            className="text-xs text-gray-500 hover:text-accent transition-colors flex-shrink-0 ml-auto"
            title="Clear recently viewed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

