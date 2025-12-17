import * as React from 'react'
import { Search } from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar'
import { codeLibrary, type LibraryAsset } from '@/lib/library'
import { cn } from '@/lib/utils'

type SearchFormProps = React.ComponentProps<'form'> & {
  placeholder?: string
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function getSearchLabel(asset: LibraryAsset) {
  return `${asset.displayName} ${asset.relativePath} ${asset.language}`.toLowerCase()
}

function openAssetInNewTab(urlPath: string) {
  if (typeof document === 'undefined') return
  const anchor = document.createElement('a')
  anchor.href = urlPath
  anchor.target = '_blank'
  anchor.rel = 'noreferrer noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function SearchForm({
  placeholder = 'Search assets…',
  ...props
}: SearchFormProps) {
  const { onSubmit, className, ...rest } = props
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)

  const normalizedQuery = React.useMemo(() => normalizeQuery(query), [query])

  const results = React.useMemo(() => {
    if (!normalizedQuery) return []

    const matches = codeLibrary
      .filter((asset) => getSearchLabel(asset).includes(normalizedQuery))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))

    return matches.slice(0, 12)
  }, [normalizedQuery])

  const isOpen = normalizedQuery.length > 0

  React.useEffect(() => {
    if (!isOpen) {
      setActiveIndex(0)
      return
    }

    setActiveIndex((prev) => {
      if (results.length === 0) return 0
      return Math.max(0, Math.min(prev, results.length - 1))
    })
  }, [isOpen, results.length])

  React.useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (!containerRef.current?.contains(target)) {
        setQuery('')
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen])

  const selectAsset = React.useCallback((asset: LibraryAsset) => {
    openAssetInNewTab(asset.urlPath)
    setQuery('')
    setActiveIndex(0)
    inputRef.current?.blur()
  }, [])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (results.length > 0) {
      selectAsset(results[0]!)
    }
    onSubmit?.(event)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!isOpen) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setQuery('')
      setActiveIndex(0)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) =>
        results.length === 0 ? 0 : Math.min(prev + 1, results.length - 1),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      const activeResult = results[activeIndex]
      if (activeResult) {
        event.preventDefault()
        selectAsset(activeResult)
      }
    }
  }

  return (
    <form
      {...rest}
      onSubmit={handleSubmit}
      className={cn('relative', className)}
    >
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative" ref={containerRef}>
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder={placeholder}
            className="pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="asset-search-results"
            aria-autocomplete="list"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />

          {isOpen ? (
            <div
              id="asset-search-results"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              {results.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No matches.
                </div>
              ) : (
                <div className="max-h-72 overflow-auto p-1">
                  {results.map((asset, index) => {
                    const isActive = index === activeIndex
                    return (
                      <button
                        key={asset.relativePath}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          'w-full rounded-sm px-2 py-2 text-left text-sm transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          isActive && 'bg-accent text-accent-foreground',
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectAsset(asset)}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium">{asset.displayName}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {asset.language}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {asset.relativePath}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
