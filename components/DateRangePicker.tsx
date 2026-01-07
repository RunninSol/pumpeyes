'use client'

import { useState } from 'react'

interface DateRangePickerProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
}

const PRESET_RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: -1 }, // Special case
]

export default function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false)

  const applyPreset = (days: number) => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    if (days === 0) {
      // Today
      onDateFromChange(todayStr)
      onDateToChange(todayStr)
    } else if (days === -1) {
      // This year
      const yearStart = new Date(today.getFullYear(), 0, 1)
      onDateFromChange(yearStart.toISOString().split('T')[0])
      onDateToChange(todayStr)
    } else {
      // Last N days
      const fromDate = new Date(today)
      fromDate.setDate(fromDate.getDate() - days)
      onDateFromChange(fromDate.toISOString().split('T')[0])
      onDateToChange(todayStr)
    }
    setShowCustom(false)
  }

  const clearDates = () => {
    onDateFromChange('')
    onDateToChange('')
    setShowCustom(false)
  }

  const hasActiveDates = dateFrom || dateTo

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-300">
          Launch Date
        </label>
        {hasActiveDates && (
          <button
            onClick={clearDates}
            className="text-xs text-primary hover:text-secondary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PRESET_RANGES.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.days)}
            className="px-3 py-2 text-sm bg-card border border-gray-800/50 rounded-lg hover:border-primary hover:bg-card/80 transition-all text-gray-300 hover:text-primary"
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-3 py-2 text-sm border rounded-lg transition-all ${
            showCustom
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-card border-gray-800/50 hover:border-primary text-gray-300 hover:text-primary'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom Date Inputs */}
      {showCustom && (
        <div className="space-y-2 p-3 bg-card/50 rounded-lg border border-gray-800/50">
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              max={dateTo || undefined}
              className="w-full px-3 py-2 bg-background border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              min={dateFrom || undefined}
              className="w-full px-3 py-2 bg-background border border-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
            />
          </div>
        </div>
      )}

      {/* Active Range Display */}
      {hasActiveDates && !showCustom && (
        <div className="mt-2 text-xs text-gray-400 bg-card/30 px-3 py-2 rounded-lg">
          {dateFrom && dateTo ? (
            <>
              {new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()}
            </>
          ) : dateFrom ? (
            <>From {new Date(dateFrom).toLocaleDateString()}</>
          ) : (
            <>Until {new Date(dateTo).toLocaleDateString()}</>
          )}
        </div>
      )}
    </div>
  )
}

