'use client'

import { useState, useEffect, useRef } from 'react'
import { getTokenTags, addTagToToken, removeTagFromToken, SUGGESTED_TAGS } from '@/lib/userTags'
import { categorizeToken, CATEGORIES } from '@/lib/categorizer'

interface TagEditorProps {
  tokenAddress: string
  tokenName: string
  tokenDescription?: string | null
  tokenSymbol?: string
  compact?: boolean
}

export default function TagEditor({ 
  tokenAddress, 
  tokenName, 
  tokenDescription, 
  tokenSymbol,
  compact = false 
}: TagEditorProps) {
  const [tags, setTags] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [autoCategory, setAutoCategory] = useState<string>('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTags(getTokenTags(tokenAddress))
    setAutoCategory(categorizeToken(tokenName, tokenDescription, tokenSymbol))
  }, [tokenAddress, tokenName, tokenDescription, tokenSymbol])

  useEffect(() => {
    const handleChange = () => {
      setTags(getTokenTags(tokenAddress))
    }
    window.addEventListener('userTagsChanged', handleChange)
    return () => window.removeEventListener('userTagsChanged', handleChange)
  }, [tokenAddress])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      addTagToToken(tokenAddress, trimmed)
      setTags([...tags, trimmed])
    }
    setInputValue('')
  }

  const handleRemoveTag = (tag: string) => {
    removeTagFromToken(tokenAddress, tag)
    setTags(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleAddTag(inputValue)
    }
  }

  // Filter suggestions based on input
  const filteredSuggestions = SUGGESTED_TAGS.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  )

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {/* Auto-category badge */}
        <span className="px-1.5 py-0.5 text-[8px] rounded bg-primary/20 text-primary border border-primary/30">
          {autoCategory}
        </span>
        {/* User tags */}
        {tags.slice(0, 2).map(tag => (
          <span 
            key={tag}
            className="px-1.5 py-0.5 text-[8px] rounded bg-secondary/20 text-secondary border border-secondary/30"
          >
            {tag}
          </span>
        ))}
        {tags.length > 2 && (
          <span className="text-[8px] text-gray-500">+{tags.length - 2}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="p-0.5 rounded hover:bg-gray-800 transition-colors"
          title="Edit tags"
        >
          <svg className="w-2.5 h-2.5 text-gray-500 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 mt-1 w-48 bg-card border border-gray-700 rounded-lg shadow-xl p-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[10px] text-gray-400 mb-1">Auto: {autoCategory}</div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag..."
              className="w-full px-2 py-1 text-xs bg-background border border-gray-700 rounded focus:outline-none focus:border-primary text-text"
              autoFocus
            />
            {filteredSuggestions.length > 0 && (
              <div className="mt-1 max-h-24 overflow-y-auto">
                {filteredSuggestions.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="block w-full text-left px-2 py-0.5 text-[10px] text-gray-400 hover:text-primary hover:bg-gray-800 rounded"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-700">
                <div className="text-[9px] text-gray-500 mb-1">Your tags:</div>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] rounded bg-secondary/20 text-secondary"
                    >
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full editor (for expanded view)
  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Auto-category badge */}
        <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary border border-primary/30">
          🤖 {autoCategory}
        </span>
        
        {/* User tags */}
        {tags.map(tag => (
          <span 
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/20 text-secondary border border-secondary/30"
          >
            {tag}
            <button 
              onClick={() => handleRemoveTag(tag)}
              className="hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Add tag button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1 text-xs rounded border border-dashed border-gray-600 text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          + Add Tag
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-card border border-gray-700 rounded-lg shadow-xl p-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a tag and press Enter..."
            className="w-full px-3 py-2 text-sm bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-text"
            autoFocus
          />
          
          {filteredSuggestions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Suggestions:</div>
              <div className="flex flex-wrap gap-1">
                {filteredSuggestions.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-400 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

