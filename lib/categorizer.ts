// AI Auto-Categorization based on token name and description
// Maps keywords to categories

export const CATEGORIES = [
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
  'Culture',
  'Anime',
  'Other'
] as const;

export type TokenCategory = typeof CATEGORIES[number];

// Keyword mappings for auto-categorization
const CATEGORY_KEYWORDS: Record<TokenCategory, string[]> = {
  'Meme': [
    'meme', 'pepe', 'doge', 'wojak', 'chad', 'based', 'cope', 'seethe', 
    'npc', 'kek', 'lol', 'lmao', 'bruh', 'wen', 'moon', 'lambo', 'hodl',
    'frog', 'shib', 'bonk', 'floki', 'elon', 'gm', 'wagmi', 'ngmi',
    'rug', 'pump', 'dump', 'ape', '69', '420', 'retard', 'tard', 'autist',
    'stonk', 'tendies', 'diamond', 'hands', 'paper', 'bag', 'rekt'
  ],
  'AI': [
    'ai', 'artificial', 'intelligence', 'gpt', 'llm', 'neural', 'machine',
    'learning', 'bot', 'agent', 'chatbot', 'openai', 'anthropic', 'claude',
    'gemini', 'copilot', 'auto', 'smart', 'cognitive', 'deep', 'model'
  ],
  'Gaming': [
    'game', 'gaming', 'play', 'player', 'esport', 'quest', 'rpg', 'mmorpg',
    'pvp', 'pve', 'guild', 'clan', 'level', 'xp', 'loot', 'raid', 'boss',
    'minecraft', 'fortnite', 'roblox', 'steam', 'twitch', 'streamer'
  ],
  'DeFi': [
    'defi', 'swap', 'dex', 'amm', 'liquidity', 'yield', 'farm', 'stake',
    'lending', 'borrow', 'vault', 'protocol', 'dao', 'governance', 'treasury',
    'apy', 'apr', 'tvl', 'pool', 'lp', 'token'
  ],
  'NFT': [
    'nft', 'jpeg', 'pfp', 'art', 'artist', 'collection', 'mint', 'rare',
    'legendary', 'epic', 'common', 'opensea', 'blur', 'magic eden', 'tensor'
  ],
  'Animal': [
    'dog', 'cat', 'bird', 'fish', 'bear', 'bull', 'whale', 'shark', 'lion',
    'tiger', 'monkey', 'ape', 'gorilla', 'elephant', 'wolf', 'fox', 'rabbit',
    'hamster', 'rat', 'mouse', 'snake', 'dragon', 'unicorn', 'penguin',
    'duck', 'chicken', 'cow', 'pig', 'horse', 'deer', 'owl', 'eagle', 'hawk',
    'shiba', 'inu', 'corgi', 'poodle', 'kitten', 'puppy', 'kitty', 'doggy'
  ],
  'Celebrity': [
    'trump', 'biden', 'obama', 'elon', 'musk', 'kanye', 'ye', 'drake',
    'taylor', 'swift', 'kim', 'kardashian', 'celebrity', 'famous', 'star',
    'influencer', 'youtuber', 'tiktoker', 'streamer', 'actor', 'actress',
    'singer', 'rapper', 'athlete', 'lebron', 'messi', 'ronaldo', 'jordan'
  ],
  'Politics': [
    'trump', 'biden', 'obama', 'democrat', 'republican', 'congress', 'senate',
    'president', 'election', 'vote', 'government', 'politics', 'political',
    'liberal', 'conservative', 'left', 'right', 'maga', 'freedom', 'liberty',
    'usa', 'america', 'american', 'patriot', 'constitution'
  ],
  'Food': [
    'food', 'pizza', 'burger', 'taco', 'sushi', 'ramen', 'noodle', 'rice',
    'bread', 'cake', 'cookie', 'candy', 'chocolate', 'ice cream', 'coffee',
    'tea', 'beer', 'wine', 'whiskey', 'vodka', 'fruit', 'banana', 'apple',
    'orange', 'grape', 'strawberry', 'meat', 'chicken', 'beef', 'pork'
  ],
  'Sports': [
    'sport', 'football', 'soccer', 'basketball', 'baseball', 'hockey',
    'tennis', 'golf', 'boxing', 'mma', 'ufc', 'wrestling', 'olympics',
    'nba', 'nfl', 'mlb', 'nhl', 'fifa', 'world cup', 'champion', 'league'
  ],
  'Music': [
    'music', 'song', 'album', 'band', 'rock', 'pop', 'hip hop', 'rap',
    'jazz', 'classical', 'edm', 'techno', 'house', 'dj', 'producer',
    'spotify', 'soundcloud', 'concert', 'festival', 'vinyl', 'beat'
  ],
  'Tech': [
    'tech', 'technology', 'software', 'hardware', 'computer', 'phone',
    'mobile', 'app', 'web', 'internet', 'cloud', 'crypto', 'blockchain',
    'bitcoin', 'ethereum', 'solana', 'web3', 'metaverse', 'vr', 'ar',
    'coding', 'developer', 'engineer', 'startup', 'silicon', 'valley'
  ],
  'Culture': [
    'culture', 'art', 'movie', 'film', 'tv', 'show', 'series', 'anime',
    'manga', 'comic', 'book', 'novel', 'story', 'meme', 'viral', 'trend',
    'fashion', 'style', 'design', 'creative', 'aesthetic'
  ],
  'Anime': [
    'anime', 'manga', 'otaku', 'waifu', 'husbando', 'kawaii', 'senpai',
    'naruto', 'goku', 'luffy', 'one piece', 'dragon ball', 'attack titan',
    'demon slayer', 'jujutsu', 'kaisen', 'my hero', 'academia', 'pokemon',
    'pikachu', 'charizard', 'studio ghibli', 'miyazaki', 'hentai', 'ecchi'
  ],
  'Other': []
};

/**
 * Auto-categorize a token based on its name and description
 */
export function categorizeToken(name: string, description?: string | null, symbol?: string): TokenCategory {
  const text = `${name || ''} ${description || ''} ${symbol || ''}`.toLowerCase();
  
  // Score each category based on keyword matches
  const scores: Record<TokenCategory, number> = {} as Record<TokenCategory, number>;
  
  for (const category of CATEGORIES) {
    if (category === 'Other') continue;
    
    const keywords = CATEGORY_KEYWORDS[category];
    let score = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        // Longer keywords get higher scores (more specific)
        score += keyword.length;
      }
    }
    
    scores[category] = score;
  }
  
  // Find category with highest score
  let bestCategory: TokenCategory = 'Other';
  let bestScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as TokenCategory;
    }
  }
  
  return bestCategory;
}

/**
 * Get all matching categories for a token (for multi-tagging)
 */
export function getAllMatchingCategories(name: string, description?: string | null, symbol?: string): TokenCategory[] {
  const text = `${name || ''} ${description || ''} ${symbol || ''}`.toLowerCase();
  const matches: TokenCategory[] = [];
  
  for (const category of CATEGORIES) {
    if (category === 'Other') continue;
    
    const keywords = CATEGORY_KEYWORDS[category];
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matches.push(category);
        break; // Only add each category once
      }
    }
  }
  
  return matches.length > 0 ? matches : ['Other'];
}

