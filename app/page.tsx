'use client'

import SearchSidebar from '@/components/SearchSidebar'
import TokenGrid from '@/components/TokenGrid'
import { useState } from 'react'

type Tab = 'all' | 'favorites'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    maxMcap: '',
    hasTwitter: false,
    hasWebsite: false,
    hasTelegram: false,
  })
  const [favoritesCount, setFavoritesCount] = useState(0)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Sidebar - 25% */}
      <div className="w-1/4 border-r border-gray-800 bg-background">
        <SearchSidebar 
          filters={filters} 
          onFiltersChange={setFilters}
          favoritesCount={favoritesCount}
        />
      </div>

      {/* Right Content - 75% */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Tabs */}
        <div className="border-b border-gray-800/50 bg-background">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-medium transition-all relative ${
                activeTab === 'all'
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              All Tokens
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-4 font-medium transition-all relative flex items-center ${
                activeTab === 'favorites'
                  ? 'text-secondary'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Favorites
              {favoritesCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                  {favoritesCount}
                </span>
              )}
              {activeTab === 'favorites' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary to-accent"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <TokenGrid 
            filters={filters}
            showFavoritesOnly={activeTab === 'favorites'}
            onFavoritesCountChange={setFavoritesCount}
          />
        </div>
      </div>
    </div>
  )
}

