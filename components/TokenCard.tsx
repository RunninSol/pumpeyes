'use client'

import { Token } from '@/types/token'
import { useState, useEffect } from 'react'
import { isFavorite, toggleFavorite } from '@/lib/favorites'
import { addRecentlyViewed } from '@/lib/recentlyViewed'

interface TokenCardProps {
  token: Token
  onFavoriteChange?: () => void
  isHighlighted?: boolean
}

export default function TokenCard({ token, onFavoriteChange, isHighlighted }: TokenCardProps) {
  const [isFav, setIsFav] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dexLoading, setDexLoading] = useState(false)
  const [pairAddress, setPairAddress] = useState<string | null>(null)

  useEffect(() => {
    setIsFav(isFavorite(token.address))
  }, [token.address])

  // Add to recently viewed when interacting with the token
  const trackView = () => {
    addRecentlyViewed({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      image: token.image || undefined
    })
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFavState = toggleFavorite(token.address)
    setIsFav(newFavState)
    onFavoriteChange?.()
  }

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(token.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const fetchPairAddress = async () => {
    if (pairAddress) return pairAddress // Already fetched
    
    setDexLoading(true)
    try {
      // Fetch pair data from DEXScreener API
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`)
      const data = await response.json()
      
      if (data.pairs && data.pairs.length > 0) {
        // Get the pair with highest liquidity (usually the main pair)
        const mainPair = data.pairs.reduce((prev: any, current: any) => 
          (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? current : prev
        )
        setPairAddress(mainPair.pairAddress)
        return mainPair.pairAddress
      }
      return null
    } catch (error) {
      console.error('Failed to fetch pair data:', error)
      return null
    } finally {
      setDexLoading(false)
    }
  }

  const handleDexClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackView() // Track this token as recently viewed
    
    const pair = await fetchPairAddress()
    if (pair) {
      window.open(`https://dexscreener.com/solana/${pair}`, '_blank')
    } else {
      // Fallback: open with token address
      window.open(`https://dexscreener.com/solana/${token.address}`, '_blank')
    }
  }

  const handleAxiomClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackView() // Track this token as recently viewed
    
    const pair = await fetchPairAddress()
    if (pair) {
      window.open(`https://axiom.trade/meme/${pair}?chain=sol`, '_blank')
    } else {
      // Fallback: open with token address
      window.open(`https://axiom.trade/meme/${token.address}?chain=sol`, '_blank')
    }
  }

  const formatDate = (date: Date) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) return 'Unknown'
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj)
    } catch (error) {
      return 'Unknown'
    }
  }

  const formatMcap = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <div 
      id={`token-${token.address}`}
      className={`bg-card rounded-lg border transition-all duration-200 overflow-hidden relative flex flex-col group ${
        isHighlighted 
          ? 'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/50' 
          : 'border-gray-800/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
      }`}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-background/90 hover:bg-primary/20 border border-gray-800/50 hover:border-primary/50 transition-all"
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFav ? (
          <svg className="w-3.5 h-3.5 text-secondary fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        )}
      </button>

      {/* PFP Image Container - Responsive Square */}
      <div className="w-full flex items-center justify-center pt-2 pb-1.5 px-2">
        <div className="w-[70%] aspect-square max-w-[140px] rounded-lg bg-gray-900/50 flex items-center justify-center overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors">
          {token.image && token.image !== '/placeholder-pfp.png' ? (
            <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-gray-600">{token.symbol?.[0] || '?'}</span>
          )}
        </div>
      </div>

      {/* Token Info */}
      <div className="px-2 pb-2 flex-1 flex flex-col min-h-0">
        {/* Name & Symbol - Centered */}
        <div className="mb-1.5 text-center">
          <h3 className="text-sm font-bold text-text truncate leading-tight">{token.name}</h3>
          <p className="text-xs text-gray-400 truncate">${token.symbol}</p>
        </div>

        {/* Stats Grid - Compact */}
        <div className="space-y-0.5 text-[11px] flex-1 min-h-0">
          <div className="flex justify-between">
            <span className="text-gray-500">Launched:</span>
            <span className="text-text font-medium">{formatDate(token.launchDate)}</span>
          </div>
          
          {token.ath && (
            <div className="flex justify-between">
              <span className="text-gray-500">ATH:</span>
              <span className="text-primary font-medium">{formatMcap(token.ath)}</span>
            </div>
          )}
          
          {token.ath_last24hrs && (
            <div className="flex justify-between">
              <span className="text-gray-500">24h High:</span>
              <span className="text-secondary font-medium">{formatMcap(token.ath_last24hrs)}</span>
            </div>
          )}
          
          {token.category && (
            <div className="flex justify-between">
              <span className="text-gray-500">Category:</span>
              <span className="text-text font-medium text-right text-[11px] leading-tight max-w-[55%] truncate" title={token.category}>
                {token.category}
              </span>
            </div>
          )}
        </div>

        {/* Social Links & Buttons - Compact */}
        <div className="space-y-1 pt-1.5 mt-1.5 border-t border-gray-800/50">
          {/* Row 1: Social Links + Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {token.twitter && (
              <a
                href={token.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1DA1F2] hover:text-[#1a8cd8] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
            )}
            {token.website && (
              <a
                href={token.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#10b981] hover:text-[#059669] transition-colors"
                aria-label="Website"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            )}
            {token.telegram && (
              <a
                href={token.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0088cc] hover:text-[#006699] transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            )}
            <button
              onClick={handleDexClick}
              disabled={dexLoading}
              className="px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/50 hover:border-primary rounded transition-all disabled:opacity-50"
              title="View on DEXScreener"
            >
              {dexLoading ? '...' : 'DEX'}
            </button>
            <button
              onClick={handleAxiomClick}
              disabled={dexLoading}
              className="px-1.5 py-0.5 text-[9px] font-bold bg-secondary/10 text-secondary hover:bg-secondary hover:text-white border border-secondary/50 hover:border-secondary rounded transition-all disabled:opacity-50"
              title="View on Axiom"
            >
              {dexLoading ? '...' : 'AXM'}
            </button>
          </div>
          
          {/* Row 2: Address */}
          <div className="flex justify-center">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1 group hover:bg-gray-800/50 px-1.5 py-0.5 rounded transition-all"
              title="Copy address"
            >
              <span className="text-[9px] text-secondary font-mono group-hover:text-primary transition-colors">
                {token.address.slice(0, 4)}...{token.address.slice(-4)}
              </span>
              {copied ? (
                <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

