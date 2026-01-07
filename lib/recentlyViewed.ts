'use client'

const STORAGE_KEY = 'recentlyViewedTokens'
const MAX_RECENT = 10

export interface RecentToken {
  address: string
  name: string
  symbol: string
  image?: string
  viewedAt: number
}

export function getRecentlyViewed(): RecentToken[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addRecentlyViewed(token: { address: string; name: string; symbol: string; image?: string }) {
  if (typeof window === 'undefined') return
  
  try {
    let recent = getRecentlyViewed()
    
    // Remove if already exists
    recent = recent.filter(t => t.address !== token.address)
    
    // Add to beginning
    recent.unshift({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      image: token.image,
      viewedAt: Date.now()
    })
    
    // Keep only MAX_RECENT items
    recent = recent.slice(0, MAX_RECENT)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
    
    // Dispatch custom event for components to react
    window.dispatchEvent(new CustomEvent('recentlyViewedChanged'))
  } catch (error) {
    console.error('Error saving recently viewed:', error)
  }
}

export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('recentlyViewedChanged'))
}

