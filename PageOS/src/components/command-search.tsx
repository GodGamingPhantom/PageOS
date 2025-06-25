"use client"
import React from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function CommandSearch() {
  const [value, setValue] = React.useState('')
  
  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 font-body text-accent/80 flex items-center gap-2 pointer-events-none">
        <span>&gt;</span>
        <span className="animate-cursor-blink bg-accent w-2 h-4 inline-block" />
      </span>
      <Input
        type="text"
        placeholder="Filter by title, author, or source..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-input border-border/50 pl-14 h-12 text-lg focus:border-accent"
      />
      <button className="absolute right-4 text-accent/80 hover:text-accent transition-colors">
        <Search />
      </button>
    </div>
  )
}
