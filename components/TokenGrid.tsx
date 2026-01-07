'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Token } from '@/types/token'
import SearchBar from './SearchBar'
import TokenCard from './TokenCard'
import { FilterOptions } from './SearchSidebar'
import { getFavorites } from '@/lib/favorites'

interface TokenGridProps {
  filters: FilterOptions
  showFavoritesOnly: boolean
  onFavoritesCountChange?: (count: number) => void
}

export default function TokenGrid({ filters, showFavoritesOnly, onFavoritesCountChange }: TokenGridProps) {
  const [favoritesVersion, setFavoritesVersion] = useState(0)

  // Update favorites count whenever favorites change
  useEffect(() => {
    const favorites = getFavorites()
    onFavoritesCountChange?.(favorites.length)
  }, [favoritesVersion, onFavoritesCountChange])

  const handleFavoriteChange = () => {
    // Increment version to trigger re-render and count update
    setFavoritesVersion(v => v + 1)
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [searchResults, setSearchResults] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 1000
  const observer = useRef<IntersectionObserver | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Server-side search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      setSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=100`)
          const data = await response.json()
          if (data.success) {
            setSearchResults(data.tokens)
          }
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setSearching(false)
        }
      }, 300) // 300ms debounce
    } else {
      setSearchResults([])
      setSearching(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Fetch initial tokens when filters change or when not showing favorites only
  useEffect(() => {
    if (!showFavoritesOnly) {
      setOffset(0)
      setHasMore(true)
      fetchTokens(0, true)
    } else {
      // When showing favorites only, just set loading to false
      setLoading(false)
    }
  }, [showFavoritesOnly, filters.dateFrom, filters.dateTo, filters.maxMcap, filters.hasTwitter, filters.hasWebsite, filters.hasTelegram])

  async function fetchTokens(currentOffset: number, isInitial: boolean = false) {
    try {
      if (isInitial) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      // Build query params with filters
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      })
      
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.maxMcap) params.append('maxMarketCap', filters.maxMcap)
      if (filters.hasTwitter) params.append('hasTwitter', 'true')
      if (filters.hasWebsite) params.append('hasWebsite', 'true')
      if (filters.hasTelegram) params.append('hasTelegram', 'true')
      
      const response = await fetch(`/api/tokens?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }
      
      const data = await response.json()
      
      if (data.success && data.tokens) {
        if (isInitial) {
          setTokens(data.tokens)
        } else {
          setTokens(prev => [...prev, ...data.tokens])
        }
        
        // If we got fewer tokens than the limit, we've reached the end
        if (data.tokens.length < limit) {
          setHasMore(false)
        }
        
        setOffset(currentOffset + data.tokens.length)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching tokens:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tokens')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more tokens when user scrolls to bottom
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !searchQuery && !showFavoritesOnly) {
      fetchTokens(offset, false)
    }
  }, [loadingMore, hasMore, offset, searchQuery, showFavoritesOnly])

  // Intersection observer for infinite scroll
  const lastTokenRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore || showFavoritesOnly) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searchQuery && !showFavoritesOnly) {
        loadMore()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore, loadMore, searchQuery, showFavoritesOnly])

  // Filter tokens based on search query and favorites
  // Note: Date, market cap, and social link filters are now handled server-side
  const filteredTokens = useMemo(() => {
    // If searching, use search results instead of loaded tokens
    let result = searchQuery.trim().length >= 2 ? searchResults : tokens

    // Favorites filter (client-side only since it's stored in localStorage)
    if (showFavoritesOnly) {
      const favorites = getFavorites()
      result = result.filter(token => favorites.includes(token.address))
    }

    return result
  }, [tokens, searchResults, searchQuery, showFavoritesOnly, favoritesVersion])

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar - Sticky Top */}
      <div className="sticky top-0 z-10 bg-background border-b border-gray-800 p-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Token Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {searching && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <p className="text-gray-400 text-sm">Searching...</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-400">Loading tokens...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-2">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-white transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-400 mb-2">
                {searchQuery ? 'No tokens found matching your search' : 'No tokens available'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-500">
                  Run the sync process to import tokens from Dune Analytics
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-gray-400">
              Showing {filteredTokens.length} {filteredTokens.length === 1 ? 'token' : 'tokens'}
              {!searchQuery && hasMore && !showFavoritesOnly && ` (scroll for more)`}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTokens.map((token, index) => {
                // Attach ref to last token for infinite scroll (only on All Tokens tab)
                if (index === filteredTokens.length - 1 && !searchQuery && !showFavoritesOnly) {
                  return <div key={token.address} ref={lastTokenRef}><TokenCard token={token} onFavoriteChange={handleFavoriteChange} /></div>
                }
                return <TokenCard key={token.address} token={token} onFavoriteChange={handleFavoriteChange} />
              })}
            </div>
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center mt-8 mb-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-400">Loading more tokens...</span>
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && !searchQuery && !showFavoritesOnly && tokens.length > 0 && (
              <div className="text-center mt-8 mb-4 text-gray-500">
                All tokens loaded ({tokens.length} total)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

