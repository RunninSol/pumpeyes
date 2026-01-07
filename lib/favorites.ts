// Favorites management using localStorage

const FAVORITES_KEY = 'pumpfun_favorites'

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading favorites:', error)
    return []
  }
}

export function addFavorite(address: string): void {
  const favorites = getFavorites()
  if (!favorites.includes(address)) {
    favorites.push(address)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }
}

export function removeFavorite(address: string): void {
  const favorites = getFavorites()
  const filtered = favorites.filter(addr => addr !== address)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
}

export function isFavorite(address: string): boolean {
  return getFavorites().includes(address)
}

export function toggleFavorite(address: string): boolean {
  const isCurrentlyFavorite = isFavorite(address)
  if (isCurrentlyFavorite) {
    removeFavorite(address)
  } else {
    addFavorite(address)
  }
  return !isCurrentlyFavorite
}

