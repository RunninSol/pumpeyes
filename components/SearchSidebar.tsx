'use client'

import { useState, useEffect } from 'react'
import DateRangePicker from './DateRangePicker'

export interface FilterOptions {
  dateFrom: string
  dateTo: string
  minMcap: string
  maxMcap: string
  category: string
  sortBy: string
  hasTwitter: boolean
  hasWebsite: boolean
  hasTelegram: boolean
  hasImage: boolean
  hasDescription: boolean
}

interface SearchSidebarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  favoritesCount: number
}

export default function SearchSidebar({ filters, onFiltersChange, favoritesCount }: SearchSidebarProps) {
  const [categories, setCategories] = useState<string[]>([])

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories)
        }
      })
      .catch(console.error)
  }, [])

  const handleFilterChange = (key: keyof FilterOptions, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateFrom: '',
      dateTo: '',
      minMcap: '',
      maxMcap: '',
      category: '',
      sortBy: 'launch_date_desc',
      hasTwitter: false,
      hasWebsite: false,
      hasTelegram: false,
      hasImage: false,
      hasDescription: false,
    })
  }

  const hasActiveFilters = 
    filters.dateFrom || 
    filters.dateTo || 
    filters.minMcap ||
    filters.maxMcap || 
    filters.category ||
    filters.sortBy !== 'launch_date_desc' ||
    filters.hasTwitter || 
    filters.hasWebsite || 
    filters.hasTelegram ||
    filters.hasImage ||
    filters.hasDescription

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
          >
            <option value="launch_date_desc">Newest First</option>
            <option value="launch_date_asc">Oldest First</option>
            <option value="ath_desc">Highest ATH</option>
            <option value="ath_asc">Lowest ATH</option>
            <option value="ath_24h_desc">Highest 24h High</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Launch Date Range */}
        <DateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(date) => handleFilterChange('dateFrom', date)}
          onDateToChange={(date) => handleFilterChange('dateTo', date)}
        />

        {/* Market Cap Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Market Cap Range (ATH)
          </label>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minMcap}
                  onChange={(e) => handleFilterChange('minMcap', e.target.value)}
                  className="w-full pl-6 pr-2 py-2 bg-card border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                  min="0"
                />
              </div>
              <span className="text-gray-500">—</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxMcap}
                  onChange={(e) => handleFilterChange('maxMcap', e.target.value)}
                  className="w-full pl-6 pr-2 py-2 bg-card border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                  min="0"
                />
              </div>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => { handleFilterChange('minMcap', ''); handleFilterChange('maxMcap', '10000'); }}
                className="px-2 py-1 text-xs bg-card border border-gray-700 rounded hover:border-primary transition-colors text-gray-400 hover:text-primary"
              >
                &lt;$10K
              </button>
              <button
                type="button"
                onClick={() => { handleFilterChange('minMcap', '10000'); handleFilterChange('maxMcap', '100000'); }}
                className="px-2 py-1 text-xs bg-card border border-gray-700 rounded hover:border-primary transition-colors text-gray-400 hover:text-primary"
              >
                $10K-$100K
              </button>
              <button
                type="button"
                onClick={() => { handleFilterChange('minMcap', '100000'); handleFilterChange('maxMcap', '1000000'); }}
                className="px-2 py-1 text-xs bg-card border border-gray-700 rounded hover:border-primary transition-colors text-gray-400 hover:text-primary"
              >
                $100K-$1M
              </button>
              <button
                type="button"
                onClick={() => { handleFilterChange('minMcap', '1000000'); handleFilterChange('maxMcap', ''); }}
                className="px-2 py-1 text-xs bg-card border border-gray-700 rounded hover:border-primary transition-colors text-gray-400 hover:text-primary"
              >
                $1M+
              </button>
            </div>
          </div>
        </div>

        {/* Has Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Has Content
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasImage}
                onChange={(e) => handleFilterChange('hasImage', e.target.checked)}
                className="w-4 h-4 rounded border-gray-800 bg-card text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 accent-primary"
              />
              <span className="ml-3 text-gray-300 group-hover:text-primary transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Has Image
              </span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasDescription}
                onChange={(e) => handleFilterChange('hasDescription', e.target.checked)}
                className="w-4 h-4 rounded border-gray-800 bg-card text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 accent-primary"
              />
              <span className="ml-3 text-gray-300 group-hover:text-primary transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Has Description
              </span>
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Has Social Links
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasTwitter}
                onChange={(e) => handleFilterChange('hasTwitter', e.target.checked)}
                className="w-4 h-4 rounded border-gray-800 bg-card text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 accent-primary"
              />
              <span className="ml-3 text-gray-300 group-hover:text-[#1DA1F2] transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
                Twitter
              </span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasWebsite}
                onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
                className="w-4 h-4 rounded border-gray-800 bg-card text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 accent-primary"
              />
              <span className="ml-3 text-gray-300 group-hover:text-[#10b981] transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasTelegram}
                onChange={(e) => handleFilterChange('hasTelegram', e.target.checked)}
                className="w-4 h-4 rounded border-gray-800 bg-card text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 accent-primary"
              />
              <span className="ml-3 text-gray-300 group-hover:text-[#0088cc] transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

