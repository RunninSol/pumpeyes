'use client'

import { useState } from 'react'
import DateRangePicker from './DateRangePicker'

export interface FilterOptions {
  dateFrom: string
  dateTo: string
  maxMcap: string
  hasTwitter: boolean
  hasWebsite: boolean
  hasTelegram: boolean
}

interface SearchSidebarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  favoritesCount: number
}

export default function SearchSidebar({ filters, onFiltersChange, favoritesCount }: SearchSidebarProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateFrom: '',
      dateTo: '',
      maxMcap: '',
      hasTwitter: false,
      hasWebsite: false,
      hasTelegram: false,
    })
  }

  const hasActiveFilters = 
    filters.dateFrom || 
    filters.dateTo || 
    filters.maxMcap || 
    filters.hasTwitter || 
    filters.hasWebsite || 
    filters.hasTelegram

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
        {/* Launch Date Range */}
        <DateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(date) => handleFilterChange('dateFrom', date)}
          onDateToChange={(date) => handleFilterChange('dateTo', date)}
        />

        {/* Max Market Cap */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Market Cap
          </label>
          <div className="space-y-2">
          <select
            value={filters.maxMcap}
            onChange={(e) => handleFilterChange('maxMcap', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
            >
              <option value="">All</option>
              <option value="100000">Under $100k</option>
              <option value="500000">Under $500k</option>
              <option value="1000000">Under $1M</option>
              <option value="5000000">Under $5M</option>
              <option value="10000000">Under $10M</option>
              <option value="custom">Custom...</option>
            </select>
            {filters.maxMcap === 'custom' && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  onChange={(e) => handleFilterChange('maxMcap', e.target.value || 'custom')}
                  className="w-full pl-7 pr-3 py-2 bg-card border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                  min="0"
                  step="1000"
                />
              </div>
            )}
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
              <span className="ml-3 text-gray-300 group-hover:text-primary transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
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
              <span className="ml-3 text-gray-300 group-hover:text-primary transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="ml-3 text-gray-300 group-hover:text-primary transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
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

