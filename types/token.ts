export interface Token {
  id: number
  address: string
  name: string
  symbol: string
  description?: string
  launchDate: Date
  image: string
  ath?: number
  ath_last24hrs?: number
  category?: string
  twitter?: string
  website?: string
  telegram?: string
}

