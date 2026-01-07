'use client'

// User-defined tags and category overrides stored in localStorage

const STORAGE_KEY = 'userTokenTags'
const CATEGORY_OVERRIDE_KEY = 'userCategoryOverrides'

export interface UserTags {
  [tokenAddress: string]: string[]
}

export interface CategoryOverrides {
  [tokenAddress: string]: string
}

export function getAllUserTags(): UserTags {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

export function getTokenTags(tokenAddress: string): string[] {
  const allTags = getAllUserTags()
  return allTags[tokenAddress] || []
}

export function setTokenTags(tokenAddress: string, tags: string[]) {
  if (typeof window === 'undefined') return
  
  try {
    const allTags = getAllUserTags()
    
    if (tags.length === 0) {
      delete allTags[tokenAddress]
    } else {
      allTags[tokenAddress] = tags
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTags))
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('userTagsChanged'))
  } catch (error) {
    console.error('Error saving user tags:', error)
  }
}

export function addTagToToken(tokenAddress: string, tag: string) {
  const currentTags = getTokenTags(tokenAddress)
  if (!currentTags.includes(tag)) {
    setTokenTags(tokenAddress, [...currentTags, tag])
  }
}

export function removeTagFromToken(tokenAddress: string, tag: string) {
  const currentTags = getTokenTags(tokenAddress)
  setTokenTags(tokenAddress, currentTags.filter(t => t !== tag))
}

export function getAllUsedTags(): string[] {
  const allTags = getAllUserTags()
  const tagSet = new Set<string>()
  
  for (const tags of Object.values(allTags)) {
    for (const tag of tags) {
      tagSet.add(tag)
    }
  }
  
  return Array.from(tagSet).sort()
}

export function getTokensWithTag(tag: string): string[] {
  const allTags = getAllUserTags()
  const tokens: string[] = []
  
  for (const [address, tags] of Object.entries(allTags)) {
    if (tags.includes(tag)) {
      tokens.push(address)
    }
  }
  
  return tokens
}

// Common suggested tags
export const SUGGESTED_TAGS = [
  'Meme',
  'AI',
  'Gaming',
  'DeFi',
  'NFT',
  'Animal',
  'Celebrity',
  'Politics',
  'Food',
  'Sports',
  'Music',
  'Tech',
  'Anime',
  'Watchlist',
  'Potential',
  'Avoid',
  'Researching',
  'Bought',
  'Sold'
]

// Category Override Functions
export function getAllCategoryOverrides(): CategoryOverrides {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(CATEGORY_OVERRIDE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

export function getCategoryOverride(tokenAddress: string): string | null {
  const overrides = getAllCategoryOverrides()
  return overrides[tokenAddress] || null
}

export function setCategoryOverride(tokenAddress: string, category: string | null) {
  if (typeof window === 'undefined') return
  
  try {
    const overrides = getAllCategoryOverrides()
    
    if (!category) {
      delete overrides[tokenAddress]
    } else {
      overrides[tokenAddress] = category
    }
    
    localStorage.setItem(CATEGORY_OVERRIDE_KEY, JSON.stringify(overrides))
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('categoryOverrideChanged'))
  } catch (error) {
    console.error('Error saving category override:', error)
  }
}

export function getTokensWithCategory(category: string): string[] {
  const overrides = getAllCategoryOverrides()
  const tokens: string[] = []
  
  for (const [address, cat] of Object.entries(overrides)) {
    if (cat === category) {
      tokens.push(address)
    }
  }
  
  return tokens
}

