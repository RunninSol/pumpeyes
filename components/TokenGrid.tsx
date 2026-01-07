'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Token } from '@/types/token'
import SearchBar from './SearchBar'
import TokenCard from './TokenCard'
import RecentlyViewedBar from './RecentlyViewedBar'
import { FilterOptions } from './SearchSidebar'
import { getFavorites } from '@/lib/favorites'

interface TokenGridProps {
  filters: FilterOptions
  showFavoritesOnly: boolean
  onFavoritesCountChange?: (count: number) => void
}

export default function TokenGrid({ filters, showFavoritesOnly, onFavoritesCountChange }: TokenGridProps) {
  const [favoritesVersion, setFavoritesVersion] = useState(0)
  const [highlightedAddress, setHighlightedAddress] = useState<string | null>(null)

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

  // Fetch favorites from database
  async function fetchFavorites() {
    setLoading(true)
    setError(null)
    
    try {
      const favorites = getFavorites()
      
      if (favorites.length === 0) {
        setTokens([])
        setLoading(false)
        return
      }

      // Fetch favorite tokens from database by addresses
      const response = await fetch('/api/tokens/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: favorites })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      
      if (data.success && data.tokens) {
        setTokens(data.tokens)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError(err instanceof Error ? err.message : 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  // Fetch initial tokens when filters change or when not showing favorites only
  useEffect(() => {
    if (!showFavoritesOnly) {
      setOffset(0)
      setHasMore(true)
      fetchTokens(0, true)
    } else {
      // Fetch favorites from database
      fetchFavorites()
    }
  }, [showFavoritesOnly, filters.dateFrom, filters.dateTo, filters.minMcap, filters.maxMcap, filters.category, filters.sortBy, filters.hasTwitter, filters.hasWebsite, filters.hasTelegram, filters.hasImage, filters.hasDescription, favoritesVersion])

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
      if (filters.minMcap) params.append('minMarketCap', filters.minMcap)
      if (filters.maxMcap) params.append('maxMarketCap', filters.maxMcap)
      if (filters.category) params.append('category', filters.category)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.hasTwitter) params.append('hasTwitter', 'true')
      if (filters.hasWebsite) params.append('hasWebsite', 'true')
      if (filters.hasTelegram) params.append('hasTelegram', 'true')
      if (filters.hasImage) params.append('hasImage', 'true')
      if (filters.hasDescription) params.append('hasDescription', 'true')
      
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

  // Filter tokens based on search query
  // Note: Favorites are now fetched directly from database
  // Date, market cap, and social link filters are handled server-side
  const filteredTokens = useMemo(() => {
    // If searching, use search results instead of loaded tokens
    // Otherwise use the tokens (which are either all tokens or favorites depending on tab)
    return searchQuery.trim().length >= 2 ? searchResults : tokens
  }, [tokens, searchResults, searchQuery])

  // Handle clicking on a recently viewed token
  const handleRecentTokenClick = async (address: string) => {
    // Check if token is already in the current list
    const existingToken = filteredTokens.find(t => t.address === address)
    
    if (existingToken) {
      // Scroll to the token
      const element = document.getElementById(`token-${address}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedAddress(address)
        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedAddress(null), 3000)
      }
    } else {
      // Token not in current view, fetch it and show at top
      try {
        const response = await fetch(`/api/tokens/${address}`)
        const data = await response.json()
        if (data.success && data.token) {
          // Add to beginning of tokens list
          setTokens(prev => [data.token, ...prev.filter(t => t.address !== address)])
          setHighlightedAddress(address)
          // Scroll to top
          setTimeout(() => {
            const element = document.getElementById(`token-${address}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            // Remove highlight after 3 seconds
            setTimeout(() => setHighlightedAddress(null), 3000)
          }, 100)
        }
      } catch (error) {
        console.error('Error fetching token:', error)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar - Sticky Top */}
      <div className="sticky top-0 z-10 bg-background border-b border-gray-800 p-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Recently Viewed Bar */}
      <RecentlyViewedBar onTokenClick={handleRecentTokenClick} />

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
                {searchQuery 
                  ? 'No tokens found matching your search' 
                  : showFavoritesOnly 
                    ? 'No favorite tokens yet' 
                    : 'No tokens available'}
              </p>
              {!searchQuery && showFavoritesOnly && (
                <p className="text-sm text-gray-500">
                  Click the star icon on any token card to add it to your favorites
                </p>
              )}
              {!searchQuery && !showFavoritesOnly && (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-3">
              {filteredTokens.map((token, index) => {
                const isHighlighted = highlightedAddress === token.address
                // Attach ref to last token for infinite scroll (only on All Tokens tab)
                if (index === filteredTokens.length - 1 && !searchQuery && !showFavoritesOnly) {
                  return <div key={token.address} ref={lastTokenRef}><TokenCard token={token} onFavoriteChange={handleFavoriteChange} isHighlighted={isHighlighted} /></div>
                }
                return <TokenCard key={token.address} token={token} onFavoriteChange={handleFavoriteChange} isHighlighted={isHighlighted} />
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

